import { VISUAL_CONCEPTS } from '../../src/domain/ai-search/value-objects/visual-concepts.catalog';
import { VisualSimilarityCalculator } from '../../src/domain/ai-search/services/visual-similarity.calculator';
import {
  CardEmbeddingRepository,
  ClipVisionPort
} from '../../src/domain/ai-search/repositories/card-embedding.repository.interface';
import {
  FindSimilarCardsByClipUseCase,
  GetSemanticSearchStatsUseCase,
  RunSemanticSearchTestSuiteUseCase,
  SearchByVisualDescriptionUseCase,
  SearchByVisualStyleUseCase,
  StartClipEmbeddingsGenerationUseCase
} from '../../src/application/ai-search/use-cases/semantic-search.use-cases';
import {
  CleanupOrphanImagesUseCase,
  DeleteCardImageUseCase,
  GetMissingCardImagesUseCase,
  StartBulkImageDownloadUseCase
} from '../../src/application/media/use-cases/image-stats.use-case';
import {
  CardImageMetadataPort,
  ImageStoragePort
} from '../../src/domain/media/repositories/image-storage.port';
import { Card } from '../../src/domain/catalog/entities/card.entity';
import {
  EntityNotFoundError,
  ExternalServiceUnavailableError,
  InvalidParameterError
} from '../../src/domain/shared/errors/domain.error';

function createSyntheticConceptVector(activeConcept: string, score = 0.9): number[] {
  return VISUAL_CONCEPTS.map(concept => (concept === activeConcept ? score : 0.05));
}

describe('Phase 4: AI Search (Semantic & Visual) and Media Management Use Cases', () => {
  describe('VisualSimilarityCalculator (Pure Domain Service)', () => {
    it('translates Spanish terms to English and scores matching visual concepts', () => {
      const translated = VisualSimilarityCalculator.translateQueryToEnglish('dragón azul con armadura');
      expect(translated).toContain('dragon');
      expect(translated).toContain('blue');
      expect(translated).toContain('armor');

      const dragonVector = createSyntheticConceptVector('dragon', 0.95);
      const similarity = VisualSimilarityCalculator.calculateFeatureSimilarity(
        'dragón',
        dragonVector
      );
      expect(similarity).toBeGreaterThan(0.5);
    });

    it('calculates cosine similarity and parses JSON embedding vectors safely', () => {
      expect(VisualSimilarityCalculator.calculateCosineSimilarity([1, 0], [1, 0])).toBeCloseTo(1);
      expect(VisualSimilarityCalculator.calculateCosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0);
      expect(VisualSimilarityCalculator.parseEmbeddingVector('[0.1, 0.2]')).toEqual([0.1, 0.2]);
      expect(VisualSimilarityCalculator.parseEmbeddingVector('{invalid}')).toBeNull();
    });
  });

  describe('Semantic & Visual Search Use Cases', () => {
    let mockEmbeddingRepo: jest.Mocked<CardEmbeddingRepository>;
    let mockClipVisionPort: jest.Mocked<ClipVisionPort>;

    const sampleCard = new Card({
      id: 10,
      name: 'Blue-Eyes White Dragon',
      code: 'LOB-001',
      description: 'Legendary dragon.',
      imageUrl: '/images/cards/normal/89631139.jpg',
      password: '89631139',
      rarity: 'ultra',
      frame: 'normal',
      archetype: 'Blue-Eyes',
      cardType: 'Monster',
      alterName: null
    });

    beforeEach(() => {
      const dragonVec = createSyntheticConceptVector('dragon', 0.92);
      const warriorVec = createSyntheticConceptVector('warrior', 0.88);

      mockEmbeddingRepo = {
        getEmbeddingStats: jest.fn().mockResolvedValue({
          totalCards: 100,
          cardsWithPassword: 90,
          cardsWithClipEmbedding: 80,
          completionPercentage: 89
        }),
        findCardsWithClipEmbeddings: jest.fn().mockResolvedValue([
          {
            id: 10,
            name: 'Blue-Eyes White Dragon',
            password: '89631139',
            cardType: 'Monster',
            archetype: 'Blue-Eyes',
            clipEmbedding: dragonVec
          },
          {
            id: 20,
            name: 'Celtic Guardian',
            password: '91152256',
            cardType: 'Monster',
            archetype: null,
            clipEmbedding: warriorVec
          }
        ]),
        findCardEmbeddingById: jest.fn().mockResolvedValue({
          id: 10,
          name: 'Blue-Eyes White Dragon',
          password: '89631139',
          cardType: 'Monster',
          archetype: 'Blue-Eyes',
          clipEmbedding: dragonVec
        }),
        findCardsByIds: jest.fn().mockResolvedValue([sampleCard]),
        findCardsWithoutClipEmbedding: jest
          .fn()
          .mockResolvedValue([{ id: 30, name: 'Kuriboh', password: '40640057' }]),
        updateClipEmbedding: jest.fn().mockResolvedValue(undefined)
      };

      mockClipVisionPort = {
        generateImageEmbedding: jest
          .fn()
          .mockResolvedValue(createSyntheticConceptVector('fiend', 0.8))
      };
    });

    it('searches by visual description and returns enriched cards with similarityScore', async () => {
      const useCase = new SearchByVisualDescriptionUseCase(mockEmbeddingRepo);
      const { results, meta } = await useCase.execute('dragón', 5, 'http://localhost:3000');

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Blue-Eyes White Dragon');
      expect(results[0].similarityScore).toBeGreaterThan(50);
      expect(meta.query).toBe('dragón');

      await expect(useCase.execute('   ')).rejects.toThrow(InvalidParameterError);
    });

    it('throws ExternalServiceUnavailableError (503) when no embeddings exist', async () => {
      mockEmbeddingRepo.getEmbeddingStats.mockResolvedValueOnce({
        totalCards: 100,
        cardsWithPassword: 90,
        cardsWithClipEmbedding: 0,
        completionPercentage: 0
      });
      const useCase = new SearchByVisualDescriptionUseCase(mockEmbeddingRepo);
      await expect(useCase.execute('dragón')).rejects.toThrow(ExternalServiceUnavailableError);
    });

    it('returns semantic search stats, test suite results, and starts background generation', async () => {
      const stats = await new GetSemanticSearchStatsUseCase(mockEmbeddingRepo).execute();
      expect(stats.status).toBe('available');
      expect(stats.completionPercentage).toBe(89);

      const testSuite = await new RunSemanticSearchTestSuiteUseCase(mockEmbeddingRepo).execute();
      expect(testSuite.testResults).toHaveLength(4);

      const genUseCase = new StartClipEmbeddingsGenerationUseCase(
        mockEmbeddingRepo,
        mockClipVisionPort,
        '/tmp/cropped'
      );
      const started = await genUseCase.execute(10);
      expect(started.alreadyComplete).toBe(false);
    });

    it('executes CLIP search by style presets and cardId cosine similarity', async () => {
      const byStyle = await new SearchByVisualStyleUseCase(mockEmbeddingRepo).execute(
        'blue-dragon',
        5
      );
      expect(byStyle.query).toContain('blue dragon');
      expect(byStyle.results.length).toBeGreaterThan(0);

      const similar = await new FindSimilarCardsByClipUseCase(mockEmbeddingRepo).execute('10', 5);
      expect(similar.referenceCardId).toBe('10');
      expect(similar.results).toHaveLength(1);
      expect(similar.results[0].cardId).toBe('20');
    });
  });

  describe('Media Management Use Cases (Delete, Cleanup, Missing, Download)', () => {
    let mockStoragePort: jest.Mocked<ImageStoragePort>;
    let mockMetadataPort: jest.Mocked<CardImageMetadataPort>;

    beforeEach(() => {
      mockStoragePort = {
        getStorageStats: jest.fn(),
        hasCardImage: jest.fn().mockReturnValue(false),
        resolveLocalJpgPath: jest.fn().mockReturnValue('/tmp/89631139.jpg'),
        deleteCardImage: jest.fn().mockReturnValue(['/tmp/89631139.jpg']),
        cleanupOrphanImages: jest.fn().mockReturnValue({
          deletedCount: 2,
          deletedSize: 2048,
          deletedSizeFormatted: '2 KB',
          deletedFiles: [],
          timestamp: new Date().toISOString()
        }),
        downloadCardImageOnDemand: jest.fn().mockResolvedValue('/tmp/89631139.jpg')
      };

      mockMetadataPort = {
        findAllValidPasswords: jest.fn().mockResolvedValue(new Set(['89631139'])),
        findCardsWithPassword: jest
          .fn()
          .mockResolvedValue([{ id: 1, name: 'Blue-Eyes White Dragon', password: '89631139' }])
      };
    });

    it('validates and deletes card images or throws EntityNotFoundError', () => {
      const deleteUseCase = new DeleteCardImageUseCase(mockStoragePort);
      const deleted = deleteUseCase.execute('normal', '89631139');
      expect(deleted.deletedPaths).toHaveLength(1);

      expect(() => deleteUseCase.execute('invalid', '89631139')).toThrow(InvalidParameterError);
      expect(() => deleteUseCase.execute('normal', 'abc')).toThrow(InvalidParameterError);

      mockStoragePort.deleteCardImage.mockReturnValueOnce([]);
      expect(() => deleteUseCase.execute('normal', '89631139')).toThrow(EntityNotFoundError);
    });

    it('cleans up orphan images, lists missing images, and triggers bulk download', async () => {
      const cleanup = await new CleanupOrphanImagesUseCase(
        mockStoragePort,
        mockMetadataPort
      ).execute();
      expect(cleanup.deletedCount).toBe(2);

      const missing = await new GetMissingCardImagesUseCase(
        mockStoragePort,
        mockMetadataPort
      ).execute({ limit: 10, offset: 0, type: 'normal', format: 'jpg' });
      expect(missing.total).toBe(1);
      expect(missing.cards[0].expectedPath).toBe('/images/cards/normal/89631139.jpg');

      const bulk = new StartBulkImageDownloadUseCase(
        mockStoragePort,
        mockMetadataPort
      ).execute();
      expect(bulk.message).toContain('segundo plano');
    });
  });
});

