import path from 'path';
import {
  CardEmbeddingRepository,
  ClipVisionPort
} from '../../../domain/ai-search/repositories/card-embedding.repository.interface';
import {
  BatchEmbeddingGenerationResult,
  CardEmbeddingRecord,
  VisualSimilarityMatch
} from '../../../domain/ai-search/entities/semantic-search.entities';
import { VisualSimilarityCalculator } from '../../../domain/ai-search/services/visual-similarity.calculator';
import {
  DEFAULT_SEMANTIC_TEST_QUERIES,
  VISUAL_STYLE_PRESETS
} from '../../../domain/ai-search/value-objects/visual-concepts.catalog';
import { CardPassword } from '../../../domain/shared/value-objects/card-password.value-object';
import {
  ExternalServiceUnavailableError,
  InvalidParameterError
} from '../../../domain/shared/errors/domain.error';

const CLIP_MODEL_NAME = 'Xenova/clip-vit-base-patch32';
const DEFAULT_SEARCH_LIMIT = 20;
const DEFAULT_SIMILAR_LIMIT = 12;
const TEST_QUERY_TOP_COUNT = 3;

export interface SearchVisualRequest {
  query?: string;
  limit?: number;
  baseUrl?: string;
}

export function rankCardsByVisualDescription(
  description: string,
  records: CardEmbeddingRecord[],
  limit = DEFAULT_SEARCH_LIMIT
): VisualSimilarityMatch[] {
  const matches: VisualSimilarityMatch[] = records.map(record => ({
    cardId: String(record.id),
    similarity: VisualSimilarityCalculator.calculateFeatureSimilarity(
      description,
      record.clipEmbedding
    ),
    name: record.name,
    password: record.password,
    cardType: record.cardType,
    archetype: record.archetype
  }));

  matches.sort((a, b) => b.similarity - a.similarity);
  return matches.slice(0, Math.max(1, limit));
}

function formatClipMatch(match: VisualSimilarityMatch) {
  return {
    id: match.cardId,
    cardId: match.cardId,
    name: match.name,
    password: match.password,
    cardType: match.cardType,
    archetype: match.archetype,
    similarity: match.similarity,
    similarityScore: Math.round(match.similarity * 100),
    imageUrl: match.password ? `/images/cards/cropped/${match.password}.jpg` : null,
    smallImageUrl: match.password ? `/images/cards/small/${match.password}.jpg` : null
  };
}

export class SearchByVisualDescriptionUseCase {
  constructor(private readonly embeddingRepository: CardEmbeddingRepository) {}

  public async execute(
    query?: string,
    limit = DEFAULT_SEARCH_LIMIT,
    baseUrl = ''
  ) {
    const cleanQuery = query?.trim() ?? '';
    if (cleanQuery.length === 0) {
      throw new InvalidParameterError('Se requiere parámetro "query" con la descripción visual');
    }

    const stats = await this.embeddingRepository.getEmbeddingStats();
    if (stats.cardsWithClipEmbedding === 0) {
      throw new ExternalServiceUnavailableError('Sistema de búsqueda semántica no disponible');
    }

    const records = await this.embeddingRepository.findCardsWithClipEmbeddings();
    const topMatches = rankCardsByVisualDescription(cleanQuery, records, limit);
    const results = await this.hydrateMatchesWithCards(topMatches, cleanQuery, baseUrl);

    return {
      results,
      meta: { total: results.length, query: cleanQuery }
    };
  }

  private async hydrateMatchesWithCards(
    topMatches: VisualSimilarityMatch[],
    searchQuery: string,
    baseUrl: string
  ): Promise<Record<string, unknown>[]> {
    const cardIds = topMatches.map(match => Number.parseInt(match.cardId, 10));
    const cards = await this.embeddingRepository.findCardsByIds(cardIds);
    const cardMap = new Map(cards.map(card => [String(card.id), card]));

    return topMatches
      .map(match => this.enrichMatchWithCard(match, cardMap.get(match.cardId), searchQuery, baseUrl))
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }

  private enrichMatchWithCard(
    match: VisualSimilarityMatch,
    card: { toDetailWithImages: (baseUrl: string) => unknown } | undefined,
    searchQuery: string,
    baseUrl: string
  ): Record<string, unknown> | null {
    if (!card) {
      return null;
    }

    return {
      ...(card.toDetailWithImages(baseUrl) as Record<string, unknown>),
      similarityScore: Math.round(match.similarity * 100),
      searchQuery
    };
  }
}

export class SearchByVisualStyleUseCase {
  constructor(private readonly embeddingRepository: CardEmbeddingRepository) {}

  public async execute(style?: string, limit = DEFAULT_SEARCH_LIMIT) {
    const cleanStyle = style?.trim() ?? '';
    if (cleanStyle.length === 0) {
      throw new InvalidParameterError('Se requiere un estilo');
    }

    const mappedQuery = VISUAL_STYLE_PRESETS[cleanStyle.toLowerCase()] ?? cleanStyle;
    const records = await this.embeddingRepository.findCardsWithClipEmbeddings();
    const matches = rankCardsByVisualDescription(mappedQuery, records, limit);
    const formattedResults = matches.map(formatClipMatch);

    return {
      style: cleanStyle,
      query: mappedQuery,
      resultsCount: formattedResults.length,
      results: formattedResults
    };
  }
}

export class FindSimilarCardsByClipUseCase {
  constructor(private readonly embeddingRepository: CardEmbeddingRepository) {}

  public async execute(cardIdParam?: string, limit = DEFAULT_SIMILAR_LIMIT) {
    const cleanId = cardIdParam?.trim() ?? '';
    const numericId = Number.parseInt(cleanId, 10);
    if (!cleanId || Number.isNaN(numericId) || numericId <= 0) {
      throw new InvalidParameterError('Se requiere ID de carta válido');
    }

    const referenceCard = await this.embeddingRepository.findCardEmbeddingById(numericId);
    if (!referenceCard) {
      return {
        referenceCardId: cleanId,
        resultsCount: 0,
        results: [],
        message: 'La carta de referencia no posee clip_embedding disponible.'
      };
    }

    const allCards = await this.embeddingRepository.findCardsWithClipEmbeddings();
    const formattedResults = this.rankByCosineSimilarity(referenceCard, allCards, limit);

    return {
      referenceCardId: cleanId,
      referenceCardName: referenceCard.name,
      resultsCount: formattedResults.length,
      results: formattedResults
    };
  }

  private rankByCosineSimilarity(
    referenceCard: CardEmbeddingRecord,
    allCards: CardEmbeddingRecord[],
    limit: number
  ) {
    return allCards
      .filter(candidate => candidate.id !== referenceCard.id)
      .map(candidate => ({
        cardId: String(candidate.id),
        similarity: VisualSimilarityCalculator.calculateCosineSimilarity(
          referenceCard.clipEmbedding,
          candidate.clipEmbedding
        ),
        name: candidate.name,
        password: candidate.password,
        cardType: candidate.cardType,
        archetype: candidate.archetype
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, Math.max(1, limit))
      .map(formatClipMatch);
  }
}

export class GetSemanticSearchStatsUseCase {
  constructor(private readonly embeddingRepository: CardEmbeddingRepository) {}

  public async execute() {
    const stats = await this.embeddingRepository.getEmbeddingStats();
    return {
      system: 'Búsqueda Semántica Visual con CLIP (clip_embedding)',
      model: CLIP_MODEL_NAME,
      ...stats,
      status: stats.cardsWithClipEmbedding > 0 ? 'available' : 'not_ready',
      capabilities: [
        'Búsqueda por descripción visual en texto natural (clip_embedding)',
        'Búsqueda de cartas visualmente similares mediante similitud coseno',
        'Estilos visuales predefinidos (dark-magician, blue-dragon, ghost-rare)'
      ]
    };
  }
}

export class RunSemanticSearchTestSuiteUseCase {
  constructor(private readonly embeddingRepository: CardEmbeddingRepository) {}

  public async execute() {
    const records = await this.embeddingRepository.findCardsWithClipEmbeddings();
    const testResults = DEFAULT_SEMANTIC_TEST_QUERIES.map(query => {
      const similarities = rankCardsByVisualDescription(query, records, TEST_QUERY_TOP_COUNT);
      return {
        query,
        resultsCount: similarities.length,
        topResults: similarities.map(item => ({
          name: item.name,
          similarity: Math.round(item.similarity * 100)
        }))
      };
    });

    return {
      message: 'Pruebas de búsqueda semántica completadas',
      testResults,
      timestamp: new Date().toISOString()
    };
  }
}

export class StartClipEmbeddingsGenerationUseCase {
  constructor(
    private readonly embeddingRepository: CardEmbeddingRepository,
    private readonly clipVisionPort: ClipVisionPort,
    private readonly croppedImagesDir: string
  ) {}

  public async execute(batchSize = 10) {
    const safeBatchSize = Math.max(1, batchSize);
    const stats = await this.embeddingRepository.getEmbeddingStats();

    if (stats.cardsWithClipEmbedding >= stats.cardsWithPassword) {
      return {
        alreadyComplete: true,
        message: 'Todos los embeddings CLIP ya están generados',
        stats
      };
    }

    const remaining = stats.cardsWithPassword - stats.cardsWithClipEmbedding;
    void this.generateMissingEmbeddingsInBackground();

    return {
      alreadyComplete: false,
      message: 'Generación de embeddings CLIP iniciada en segundo plano',
      note: 'Este proceso puede tardar varios minutos. Consulta los logs del servidor.',
      currentStats: stats,
      estimatedTime: `${Math.ceil(remaining / safeBatchSize)} minutos aprox.`
    };
  }

  public async generateMissingEmbeddingsInBackground(): Promise<BatchEmbeddingGenerationResult> {
    const pendingCards = await this.embeddingRepository.findCardsWithoutClipEmbedding();
    let processed = 0;
    let errors = 0;

    for (const card of pendingCards) {
      const wasUpdated = await this.processSingleCardEmbedding(card);
      if (wasUpdated) {
        processed++;
      } else {
        errors++;
      }
    }

    return { processed, errors, total: pendingCards.length };
  }

  private async processSingleCardEmbedding(card: {
    id: number;
    password: string;
  }): Promise<boolean> {
    const passwordVo = CardPassword.createOptional(card.password);
    if (!passwordVo) {
      return false;
    }

    const imagePath = path.join(this.croppedImagesDir, `${passwordVo.getNormalizedForUrl()}.jpg`);
    const embedding = await this.clipVisionPort.generateImageEmbedding(imagePath);
    if (!embedding) {
      return false;
    }

    await this.embeddingRepository.updateClipEmbedding(card.id, embedding);
    return true;
  }
}
