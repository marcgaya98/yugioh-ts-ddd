import {
  GetAllPacksUseCase,
  GetPackByIdUseCase,
  GetPackCardsUseCase
} from '../../src/application/obtention/use-cases/pack.use-cases';
import { ObtentionUseCases } from '../../src/application/obtention/use-cases/obtention.use-cases';
import {
  GetAllCharactersUseCase,
  GetCharacterByIdUseCase,
  GetCharacterDecksUseCase
} from '../../src/application/duelist/use-cases/character.use-cases';
import {
  GetAllDecksUseCase,
  GetDeckByIdUseCase,
  GetDeckCardsUseCase
} from '../../src/application/duelist/use-cases/deck.use-cases';
import {
  GameStatsUseCases,
  IconUseCases
} from '../../src/application/game-stats/use-cases/game-stats.use-cases';
import { Pack } from '../../src/domain/obtention/entities/pack.entity';
import { PackRepository } from '../../src/domain/obtention/repositories/pack.repository.interface';
import { ObtentionRepository } from '../../src/domain/obtention/repositories/obtention.repository.interface';
import { CharacterRepository } from '../../src/domain/duelist/repositories/character.repository.interface';
import { DeckRepository } from '../../src/domain/duelist/repositories/deck.repository.interface';
import {
  GameStatsRepository,
  IconRepository
} from '../../src/domain/game-stats/repositories/game-stats.repository.interface';
import {
  EntityNotFoundError,
  InvalidParameterError
} from '../../src/domain/shared/errors/domain.error';

describe('Obtention, Duelist & GameStats Use Cases', () => {
  describe('Pack & Obtention Use Cases', () => {
    const samplePack = new Pack({
      id: 1,
      name: 'First Monster',
      price: 100,
      image_url: '/pack1.jpg',
      unlock_methods: 'Initial',
      card_count: 5,
      total_cards: 50,
      description: 'Basic pack',
      description_extra: null,
      cover_card: 'Blue-Eyes'
    });

    const mockPackRepo: jest.Mocked<PackRepository> = {
      findAll: jest.fn().mockResolvedValue([samplePack]),
      findById: jest.fn().mockResolvedValue(samplePack),
      findCardsByPackId: jest.fn().mockResolvedValue([{ id: 1, name: 'Blue-Eyes' }])
    };

    const mockObtentionRepo: jest.Mocked<ObtentionRepository> = {
      getAllMethodCounts: jest.fn().mockResolvedValue([{ method: 'pack', count: 100 }]),
      getConverterCards: jest.fn().mockResolvedValue([{ id: 1, obtention: { cardsRequired: 10 } }]),
      getPackCards: jest.fn().mockResolvedValue([{ id: 1, obtention: { packId: 1 } }]),
      getCharacterCards: jest.fn().mockResolvedValue([{ id: 2, obtention: { characterId: 1 } }]),
      getTutorialCards: jest.fn().mockResolvedValue([{ id: 3, obtention: { day: 'tuesday' } }]),
      getInitialDeckCards: jest.fn().mockResolvedValue({
        cards: [{ id: 4, obtention: { quantity: 2 } }],
        meta: { total: 1, totalCards: 2 }
      }),
      getSandwichCards: jest.fn().mockResolvedValue([{ id: 5, obtention: { method: 'sandwich' } }]),
      getCardIdsByAllMethods: jest.fn().mockResolvedValue(
        new Map([
          ['pack', new Set([1, 2])],
          ['victory', new Set([2])],
          ['converter', new Set([])],
          ['tutorial', new Set([])],
          ['initial', new Set([])],
          ['sandwich', new Set([])]
        ])
      ),
      getCardsForExclusiveIds: jest.fn().mockResolvedValue([
        { id: 1, name: 'Exclusive Card', obtention: { method: 'pack' } }
      ]),
      getCardAllObtentionMethods: jest.fn().mockResolvedValue({
        card: { id: 1, name: 'Blue-Eyes' },
        obtentionMethods: { pack: [{ sourceId: 1, sourceName: 'First Monster' }] }
      })
    };

    it('handles Pack use cases and throws EntityNotFoundError on missing pack', async () => {
      expect(await new GetAllPacksUseCase(mockPackRepo).execute()).toHaveLength(1);
      expect((await new GetPackByIdUseCase(mockPackRepo).execute(1)).name).toBe('First Monster');
      expect(await new GetPackCardsUseCase(mockPackRepo).execute(1)).toHaveLength(1);

      mockPackRepo.findById.mockResolvedValueOnce(null);
      await expect(new GetPackByIdUseCase(mockPackRepo).execute(999)).rejects.toThrow(
        EntityNotFoundError
      );
    });

    it('dispatches legacy obtention methods and calculates exclusive cards via Strategy map', async () => {
      const useCases = new ObtentionUseCases(mockObtentionRepo);

      expect(await useCases.getCardsByLegacyMethod('victory')).toEqual([
        { id: 2, obtention: { characterId: 1 } }
      ]);
      await expect(useCases.getCardsByLegacyMethod('unknown')).rejects.toThrow(
        InvalidParameterError
      );

      const exclusive = await useCases.getExclusiveCards('pack');
      expect(exclusive.meta.exclusiveCount).toBe(1);
      expect(mockObtentionRepo.getCardsForExclusiveIds).toHaveBeenCalledWith('pack', [1]);
    });
  });

  describe('Character, Deck & GameStats Use Cases', () => {
    it('throws EntityNotFoundError when character, deck, bonus, challenge, highScore or icon is missing', async () => {
      const mockCharRepo: jest.Mocked<CharacterRepository> = {
        findAll: jest.fn().mockResolvedValue([]),
        findByIdWithRelations: jest.fn().mockResolvedValue(null),
        findDecksByCharacterId: jest.fn().mockResolvedValue(null)
      };

      const mockDeckRepo: jest.Mocked<DeckRepository> = {
        findAll: jest.fn().mockResolvedValue([]),
        findByIdWithDetails: jest.fn().mockResolvedValue(null),
        findCardsByDeckId: jest.fn().mockResolvedValue(null)
      };

      const mockGameStatsRepo: jest.Mocked<GameStatsRepository> = {
        findAllBonuses: jest.fn().mockResolvedValue([]),
        findBonusById: jest.fn().mockResolvedValue(null),
        findAllChallenges: jest.fn().mockResolvedValue([]),
        findChallengeById: jest.fn().mockResolvedValue(null),
        findAllHighScores: jest.fn().mockResolvedValue([]),
        findHighScoreById: jest.fn().mockResolvedValue(null)
      };

      const mockIconRepo: jest.Mocked<IconRepository> = {
        findAll: jest.fn().mockResolvedValue([]),
        findByCategory: jest.fn().mockResolvedValue([]),
        findByCategoryAndKey: jest.fn().mockResolvedValue(null)
      };

      await expect(new GetCharacterByIdUseCase(mockCharRepo).execute(99)).rejects.toThrow(
        EntityNotFoundError
      );
      await expect(new GetCharacterDecksUseCase(mockCharRepo).execute(99)).rejects.toThrow(
        EntityNotFoundError
      );
      await expect(new GetDeckByIdUseCase(mockDeckRepo).execute('uuid-1')).rejects.toThrow(
        EntityNotFoundError
      );
      await expect(new GetDeckCardsUseCase(mockDeckRepo).execute('uuid-1')).rejects.toThrow(
        EntityNotFoundError
      );

      const gameStats = new GameStatsUseCases(mockGameStatsRepo);
      await expect(gameStats.getBonusById(99)).rejects.toThrow(EntityNotFoundError);
      await expect(gameStats.getChallengeById(99)).rejects.toThrow(EntityNotFoundError);
      await expect(gameStats.getHighScoreById(99)).rejects.toThrow(EntityNotFoundError);

      const icons = new IconUseCases(mockIconRepo);
      await expect(icons.getIconByKey('attribute', 'UNKNOWN')).rejects.toThrow(
        EntityNotFoundError
      );
    });
  });
});

