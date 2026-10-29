import { Op } from 'sequelize';
import { CardModel } from '../../models/card.model';
import { Card } from '../../../../domain/catalog/entities/card.entity';
import {
  CardEmbeddingRecord,
  SemanticSearchStats
} from '../../../../domain/ai-search/entities/semantic-search.entities';
import { CardEmbeddingRepository } from '../../../../domain/ai-search/repositories/card-embedding.repository.interface';
import { VisualSimilarityCalculator } from '../../../../domain/ai-search/services/visual-similarity.calculator';

const EXCLUDED_EMBEDDING_ATTRIBUTES = ['clip_embedding'];

export class SequelizeCardEmbeddingRepository implements CardEmbeddingRepository {
  private cachedEmbeddingRecords: CardEmbeddingRecord[] | null = null;

  public async getEmbeddingStats(): Promise<SemanticSearchStats> {
    const [totalCards, cardsWithPassword, cardsWithClipEmbedding] = await Promise.all([
      CardModel.count(),
      CardModel.count({ where: { password: { [Op.not]: null } } }),
      CardModel.count({ where: { clip_embedding: { [Op.not]: null } } })
    ]);

    const completionPercentage =
      cardsWithPassword > 0
        ? Math.round((cardsWithClipEmbedding / cardsWithPassword) * 100)
        : 0;

    return {
      totalCards,
      cardsWithPassword,
      cardsWithClipEmbedding,
      completionPercentage
    };
  }

  public async findCardsWithClipEmbeddings(): Promise<CardEmbeddingRecord[]> {
    if (this.cachedEmbeddingRecords) {
      return this.cachedEmbeddingRecords;
    }

    const rows = await CardModel.findAll({
      where: { clip_embedding: { [Op.not]: null } },
      attributes: ['id', 'name', 'password', 'clip_embedding', 'cardType', 'archetype']
    });

    const records: CardEmbeddingRecord[] = [];
    for (const row of rows) {
      const vector = VisualSimilarityCalculator.parseEmbeddingVector(row.clip_embedding);
      if (!vector) {
        continue;
      }
      records.push({
        id: row.id,
        name: row.name,
        password: row.password,
        cardType: row.cardType,
        archetype: row.archetype,
        clipEmbedding: vector
      });
    }

    this.cachedEmbeddingRecords = records;
    return records;
  }

  public async findCardEmbeddingById(cardId: number): Promise<CardEmbeddingRecord | null> {
    const row = await CardModel.findOne({
      where: { id: cardId, clip_embedding: { [Op.not]: null } },
      attributes: ['id', 'name', 'password', 'clip_embedding', 'cardType', 'archetype']
    });

    if (!row) {
      return null;
    }

    const vector = VisualSimilarityCalculator.parseEmbeddingVector(row.clip_embedding);
    if (!vector) {
      return null;
    }

    return {
      id: row.id,
      name: row.name,
      password: row.password,
      cardType: row.cardType,
      archetype: row.archetype,
      clipEmbedding: vector
    };
  }

  public async findCardsByIds(ids: number[]): Promise<Card[]> {
    if (ids.length === 0) {
      return [];
    }

    const rows = await CardModel.findAll({
      where: { id: { [Op.in]: ids } },
      attributes: { exclude: EXCLUDED_EMBEDDING_ATTRIBUTES }
    });

    return rows.map(row => {
      const plain = row.toJSON() as Record<string, any>;
      return new Card({
        id: plain.id,
        name: plain.name,
        code: plain.code,
        description: plain.description,
        imageUrl: plain.image_url ?? null,
        password: plain.password ?? null,
        rarity: plain.rarity,
        frame: plain.frame,
        archetype: plain.archetype ?? null,
        cardType: plain.cardType,
        alterName: plain.alter_name ?? null
      });
    });
  }

  public async findCardsWithoutClipEmbedding(): Promise<
    Array<{ id: number; name: string; password: string }>
  > {
    const rows = await CardModel.findAll({
      where: {
        [Op.and]: [{ clip_embedding: null }, { password: { [Op.not]: null } }]
      },
      attributes: ['id', 'name', 'password'],
      order: [['id', 'ASC']]
    });

    return rows
      .filter((row): row is CardModel & { password: string } => Boolean(row.password))
      .map(row => ({ id: row.id, name: row.name, password: row.password }));
  }

  public async updateClipEmbedding(cardId: number, embedding: number[]): Promise<void> {
    await CardModel.update({ clip_embedding: embedding }, { where: { id: cardId } });
    this.cachedEmbeddingRecords = null;
  }
}

