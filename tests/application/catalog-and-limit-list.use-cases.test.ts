import { SearchCardsUseCase } from '../../src/application/catalog/use-cases/search-cards.use-case';
import { GetCardByIdUseCase } from '../../src/application/catalog/use-cases/get-card-by-id.use-case';
import { GetAllGenresUseCase } from '../../src/application/catalog/use-cases/get-all-genres.use-case';
import { GetAllArchetypesUseCase } from '../../src/application/catalog/use-cases/get-all-archetypes.use-case';
import { GetMonsterTypesUseCase } from '../../src/application/catalog/use-cases/get-monster-types.use-case';
import { GetAllLimitListsUseCase } from '../../src/application/limit-list/use-cases/get-all-limit-lists.use-case';
import { GetLimitListStatsUseCase } from '../../src/application/limit-list/use-cases/get-limit-list-stats.use-case';
import { GetAllLimitListsWithStatsUseCase } from '../../src/application/limit-list/use-cases/get-all-limit-lists-with-stats.use-case';
import { Card } from '../../src/domain/catalog/entities/card.entity';
import { Genre } from '../../src/domain/catalog/entities/genre.entity';
import { buildCardSearchCriteriaFromQuery } from '../../src/domain/catalog/value-objects/card-search-criteria.value-object';
import { CardRepository } from '../../src/domain/catalog/repositories/card.repository.interface';
import { GenreRepository } from '../../src/domain/catalog/repositories/genre.repository.interface';
import { LimitListRepository } from '../../src/domain/limit-list/repositories/limit-list.repository.interface';
import { CardLimitStatus } from '../../src/domain/limit-list/value-objects/limit-status.value-object';
import { LimitListSummary } from '../../src/domain/limit-list/entities/limit-list-stats.entity';
import { EntityNotFoundError } from '../../src/domain/shared/errors/domain.error';

describe('Catalog & LimitList Application Use Cases', () => {
  const sampleCard1 = new Card({
    id: 1,
    name: 'Pot of Greed',
    code: 'LOB-119',
    description: 'Draw 2 cards.',
    imageUrl: 'http://example.com/pot.jpg',
    password: '55144522',
    rarity: 'rare',
    frame: 'spell',
    archetype: 'Greed',
    cardType: 'Spell',
    alterName: null,
    spellData: { type: 'Normal' }
  });

  const sampleCard2 = new Card({
    id: 2,
    name: 'Blue-Eyes White Dragon',
    code: 'LOB-001',
    description: 'Legendary dragon.',
    imageUrl: 'http://example.com/bewd.jpg',
    password: '89631139',
    rarity: 'ultra',
    frame: 'normal',
    archetype: 'Blue-Eyes',
    cardType: 'Monster',
    alterName: null
  });

  let mockCardRepo: jest.Mocked<CardRepository>;
  let mockGenreRepo: jest.Mocked<GenreRepository>;
  let mockLimitListRepo: jest.Mocked<LimitListRepository>;

  beforeEach(() => {
    mockCardRepo = {
      searchWithCriteria: jest.fn().mockResolvedValue({
        cards: [sampleCard1, sampleCard2],
        totalCount: 2
      }),
      findByIdWithDetails: jest.fn().mockResolvedValue(sampleCard1),
      findDistinctArchetypes: jest.fn().mockResolvedValue(['Blue-Eyes', 'Dark Magician']),
      getMonsterTypeValues: jest.fn().mockReturnValue(['Dragon', 'Spellcaster'])
    };

    mockGenreRepo = {
      findAll: jest.fn().mockResolvedValue([
        new Genre({ id: 1, name: 'Draw', category: 'Hand' })
      ])
    };

    mockLimitListRepo = {
      findAllListNames: jest.fn().mockResolvedValue(['Game Original', 'March 2007']),
      findStatsByListName: jest.fn().mockResolvedValue(
        new LimitListSummary('Game Original', [{ status: 'forbidden', count: 28 }])
      ),
      findAllListsWithStats: jest.fn().mockResolvedValue([
        new LimitListSummary('Game Original', [{ status: 'forbidden', count: 28 }])
      ]),
      findCardIdsByListAndLimits: jest.fn().mockResolvedValue([1]),
      findStatusesForCardsInList: jest.fn().mockResolvedValue(
        new Map([
          [
            1,
            new CardLimitStatus({
              listName: 'Game Original',
              status: 'forbidden',
              limit: 0
            })
          ]
        ])
      ),
      countListedCardsInList: jest.fn().mockResolvedValue(1)
    };
  });

  describe('SearchCardsUseCase', () => {
    it('returns paginated cards enriched with limitStatus', async () => {
      const useCase = new SearchCardsUseCase(mockCardRepo, mockLimitListRepo);
      const criteria = buildCardSearchCriteriaFromQuery({ page: 1, pageSize: 10 });

      const result = await useCase.execute(criteria);

      expect(result.items).toHaveLength(2);
      expect(result.items[0].limitStatus.status).toBe('forbidden');
      expect(result.items[0].limitStatus.limit).toBe(0);
      expect(result.items[1].limitStatus.status).toBe('unlimited');
      expect(result.items[1].limitStatus.limit).toBe(3);
      expect(result.pagination.total).toBe(2);
    });

    it('pre-filters by restrictedCardIds when limitFilter does not include 3', async () => {
      const useCase = new SearchCardsUseCase(mockCardRepo, mockLimitListRepo);
      const criteria = buildCardSearchCriteriaFromQuery({ limitFilter: '0' });

      await useCase.execute(criteria);

      expect(mockLimitListRepo.findCardIdsByListAndLimits).toHaveBeenCalledWith(
        'Game Original',
        [0]
      );
      expect(mockCardRepo.searchWithCriteria).toHaveBeenCalledWith(
        expect.objectContaining({ restrictedCardIds: [1] })
      );
    });

    it('post-filters and adjusts count when limitFilter is exclusively 3 (unlimited)', async () => {
      const useCase = new SearchCardsUseCase(mockCardRepo, mockLimitListRepo);
      const criteria = buildCardSearchCriteriaFromQuery({ limitFilter: '3' });

      const result = await useCase.execute(criteria);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe(2);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('GetCardByIdUseCase & Metadata Use Cases', () => {
    it('returns detailed card with images when found', async () => {
      const useCase = new GetCardByIdUseCase(mockCardRepo);
      const result = await useCase.execute(1, 'http://localhost:3000');
      expect(result.id).toBe(1);
      expect(result.images?.normal).toContain('/images/cards/normal/55144522.jpg');
    });

    it('throws EntityNotFoundError when card does not exist', async () => {
      mockCardRepo.findByIdWithDetails.mockResolvedValueOnce(null);
      const useCase = new GetCardByIdUseCase(mockCardRepo);
      await expect(useCase.execute(999)).rejects.toThrow(EntityNotFoundError);
    });

    it('returns genres, archetypes, and monster types', async () => {
      const genres = await new GetAllGenresUseCase(mockGenreRepo).execute();
      const archetypes = await new GetAllArchetypesUseCase(mockCardRepo).execute();
      const types = new GetMonsterTypesUseCase(mockCardRepo).execute();

      expect(genres).toEqual([{ id: 1, name: 'Draw', category: 'Hand' }]);
      expect(archetypes).toEqual(['Blue-Eyes', 'Dark Magician']);
      expect(types).toEqual(['Dragon', 'Spellcaster']);
    });
  });

  describe('LimitList Use Cases', () => {
    it('returns all limit list names with count', async () => {
      const useCase = new GetAllLimitListsUseCase(mockLimitListRepo);
      const result = await useCase.execute();
      expect(result).toEqual({
        lists: ['Game Original', 'March 2007'],
        count: 2
      });
    });

    it('returns stats for a specific list and throws EntityNotFoundError if missing', async () => {
      const useCase = new GetLimitListStatsUseCase(mockLimitListRepo);
      const stats = await useCase.execute('Game Original');
      expect(stats.totalCards).toBe(28);

      mockLimitListRepo.findStatsByListName.mockResolvedValueOnce(null);
      await expect(useCase.execute('Unknown')).rejects.toThrow(EntityNotFoundError);
    });

    it('returns all limit lists with stats', async () => {
      const useCase = new GetAllLimitListsWithStatsUseCase(mockLimitListRepo);
      const result = await useCase.execute();
      expect(result.count).toBe(1);
      expect(result.lists[0].listName).toBe('Game Original');
    });
  });
});

