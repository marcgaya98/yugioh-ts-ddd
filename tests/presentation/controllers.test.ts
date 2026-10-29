import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { SequelizeCardCriteriaBuilder } from '../../src/infrastructure/persistence/repositories/catalog/sequelize-card-criteria.builder';
import { buildCardSearchCriteriaFromQuery } from '../../src/domain/catalog/value-objects/card-search-criteria.value-object';
import { CardController } from '../../src/presentation/controllers/catalog/card.controller';
import { CatalogMetadataController } from '../../src/presentation/controllers/catalog/catalog-metadata.controller';
import { LimitListController } from '../../src/presentation/controllers/limit-list/limit-list.controller';
import { PackController } from '../../src/presentation/controllers/obtention/pack.controller';
import { ObtentionController } from '../../src/presentation/controllers/obtention/obtention.controller';
import { CharacterController } from '../../src/presentation/controllers/duelist/character.controller';
import { DeckController } from '../../src/presentation/controllers/duelist/deck.controller';
import {
  GameStatsController,
  IconController
} from '../../src/presentation/controllers/game-stats/game-stats.controller';

function createMockRes(): Response {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
}

describe('Controllers & SequelizeCardCriteriaBuilder', () => {
  describe('SequelizeCardCriteriaBuilder', () => {
    it('builds Sequelize where clause using cardType (fixing legacy card_type bug)', () => {
      const criteria = buildCardSearchCriteriaFromQuery({
        name: 'Dark Magician',
        cardType: 'Monster',
        rarity: 'ultra,super'
      });

      const where = SequelizeCardCriteriaBuilder.buildWhereClause(criteria) as Record<string, any>;
      expect(where.cardType).toBe('Monster');
      expect(where.card_type).toBeUndefined();
      expect(where.rarity).toEqual({ [Op.in]: ['ultra', 'super'] });
    });

    it('builds Sequelize includes and dynamic ordering for monster attributes', () => {
      const criteria = buildCardSearchCriteriaFromQuery({
        attribute: 'DARK',
        levelMin: '7',
        spellType: 'Quick-Play',
        trapType: 'Counter',
        genres: '3',
        sortBy: 'attack',
        sortOrder: 'desc'
      });

      const includes = SequelizeCardCriteriaBuilder.buildIncludes(criteria) as any[];
      expect(includes).toHaveLength(3);
      expect(includes[0].required).toBe(true);
      expect(includes[1].required).toBe(true);
      expect(includes[2].required).toBe(true);

      const order = SequelizeCardCriteriaBuilder.buildOrder(criteria) as any[];
      expect(order[0][1]).toBe('attack');
      expect(order[0][2]).toBe('DESC');
    });
  });

  describe('All Presentation Controllers Standardized Output ({ success: true, data })', () => {
    it('CardController returns standardized responses', async () => {
      const searchUseCase = { execute: jest.fn().mockResolvedValue({ items: [], pagination: {} }) };
      const byIdUseCase = { execute: jest.fn().mockResolvedValue({ id: 1, name: 'Kuriboh' }) };
      const controller = new CardController(searchUseCase as any, byIdUseCase as any);

      const resList = createMockRes();
      await controller.getAllCards({ query: {} } as unknown as Request, resList, jest.fn());
      expect(resList.json).toHaveBeenCalledWith({
        success: true,
        data: { items: [], pagination: {} }
      });

      const resDetail = createMockRes();
      await controller.getCardById(
        {
          params: { id: '1' },
          protocol: 'http',
          get: () => 'localhost:3000'
        } as unknown as Request,
        resDetail,
        jest.fn()
      );
      expect(resDetail.json).toHaveBeenCalledWith({
        success: true,
        data: { id: 1, name: 'Kuriboh' }
      });
    });

    it('CatalogMetadataController & LimitListController return standardized responses', async () => {
      const metaController = new CatalogMetadataController({
        getAllGenresUseCase: { execute: jest.fn().mockResolvedValue([{ id: 1, name: 'Draw' }]) } as any,
        getAllArchetypesUseCase: { execute: jest.fn().mockResolvedValue(['Blue-Eyes']) } as any,
        getMonsterTypesUseCase: { execute: jest.fn().mockReturnValue(['Dragon']) } as any
      });

      const resGenres = createMockRes();
      await metaController.getAllGenres({} as Request, resGenres, jest.fn());
      expect(resGenres.json).toHaveBeenCalledWith({
        success: true,
        data: [{ id: 1, name: 'Draw' }]
      });

      const resTypes = createMockRes();
      metaController.getAllMonsterTypes({} as Request, resTypes, jest.fn());
      expect(resTypes.json).toHaveBeenCalledWith({
        success: true,
        data: ['Dragon']
      });

      const limitController = new LimitListController({
        getAllLimitListsUseCase: { execute: jest.fn().mockResolvedValue({ lists: ['Game Original'], count: 1 }) } as any,
        getLimitListStatsUseCase: { execute: jest.fn().mockResolvedValue({ listName: 'Game Original', stats: [], totalCards: 0 }) } as any,
        getAllLimitListsWithStatsUseCase: { execute: jest.fn().mockResolvedValue({ lists: [], count: 0 }) } as any
      });

      const resLimits = createMockRes();
      await limitController.getAllLimitLists({} as Request, resLimits, jest.fn());
      expect(resLimits.json).toHaveBeenCalledWith({
        success: true,
        data: { lists: ['Game Original'], count: 1 }
      });
    });

    it('PackController, ObtentionController, CharacterController, DeckController & GameStatsController return standardized responses', async () => {
      const packController = new PackController({
        getAllPacksUseCase: { execute: jest.fn().mockResolvedValue([{ id: 1 }]) } as any,
        getPackByIdUseCase: { execute: jest.fn().mockResolvedValue({ id: 1 }) } as any,
        getPackCardsUseCase: { execute: jest.fn().mockResolvedValue([{ id: 10 }]) } as any
      });
      const resPacks = createMockRes();
      await packController.getAllPacks({} as Request, resPacks, jest.fn());
      expect(resPacks.json).toHaveBeenCalledWith({ success: true, data: [{ id: 1 }] });

      const obtentionController = new ObtentionController({
        getInitialDeckCards: jest.fn().mockResolvedValue({
          cards: [{ id: 1 }],
          meta: { total: 1, totalCards: 3 }
        })
      } as any);
      const resInitDeck = createMockRes();
      await obtentionController.getInitialDeckCards({} as Request, resInitDeck, jest.fn());
      expect(resInitDeck.json).toHaveBeenCalledWith({
        success: true,
        data: [{ id: 1 }],
        meta: { total: 1, totalCards: 3 }
      });

      const characterController = new CharacterController({
        getAllCharactersUseCase: { execute: jest.fn().mockResolvedValue([{ id: 1, name: 'Jaden' }]) } as any,
        getCharacterByIdUseCase: { execute: jest.fn() } as any,
        getCharacterDecksUseCase: {
          execute: jest.fn().mockResolvedValue({
            decks: [{ id: 'd1' }],
            meta: { total: 1, offset: 0, hasMore: false }
          })
        } as any
      });
      const resCharDecks = createMockRes();
      await characterController.getCharacterDecks(
        { params: { id: '1' }, query: {} } as unknown as Request,
        resCharDecks,
        jest.fn()
      );
      expect(resCharDecks.json).toHaveBeenCalledWith({
        success: true,
        data: [{ id: 'd1' }],
        meta: { total: 1, offset: 0, hasMore: false }
      });

      const deckController = new DeckController({
        getAllDecksUseCase: { execute: jest.fn().mockResolvedValue([{ id: 'd1' }]) } as any,
        getDeckByIdUseCase: { execute: jest.fn().mockResolvedValue({ id: 'd1' }) } as any,
        getDeckCardsUseCase: { execute: jest.fn().mockResolvedValue([{ id: 1, quantity: 3 }]) } as any
      });
      const resDeckCards = createMockRes();
      await deckController.getDeckCards(
        { params: { id: 'd1' } } as unknown as Request,
        resDeckCards,
        jest.fn()
      );
      expect(resDeckCards.json).toHaveBeenCalledWith({
        success: true,
        data: [{ id: 1, quantity: 3 }]
      });

      const gameStatsController = new GameStatsController({
        getAllBonuses: jest.fn().mockResolvedValue([{ id: 1 }]),
        getBonusById: jest.fn().mockResolvedValue({ id: 1 }),
        getAllChallenges: jest.fn().mockResolvedValue([{ id: 2 }]),
        getChallengeById: jest.fn().mockResolvedValue({ id: 2 }),
        getAllHighScores: jest.fn().mockResolvedValue([{ id: 3 }]),
        getHighScoreById: jest.fn().mockResolvedValue({ id: 3 })
      } as any);

      const resChallengesCat = createMockRes();
      await gameStatsController.getChallengesByCategory(
        { params: { category: 'victory' } } as unknown as Request,
        resChallengesCat,
        jest.fn()
      );
      expect(resChallengesCat.json).toHaveBeenCalledWith({
        success: true,
        data: [{ id: 2 }]
      });

      const resHighScoresCat = createMockRes();
      await gameStatsController.getHighScoresByCategory(
        { params: { category: 'damage' } } as unknown as Request,
        resHighScoresCat,
        jest.fn()
      );
      expect(resHighScoresCat.json).toHaveBeenCalledWith({
        success: true,
        data: [{ id: 3 }]
      });

      const iconController = new IconController({
        getAllIcons: jest.fn().mockResolvedValue([{ id: 1, key: 'DARK' }]),
        getIconsByCategory: jest.fn().mockResolvedValue([{ id: 1, key: 'DARK' }]),
        getIconByKey: jest.fn().mockResolvedValue({ id: 1, key: 'DARK' })
      } as any);
      const resIcon = createMockRes();
      await iconController.getIconByKey(
        { params: { category: 'attribute', key: 'DARK' } } as unknown as Request,
        resIcon,
        jest.fn()
      );
      expect(resIcon.json).toHaveBeenCalledWith({
        success: true,
        data: { id: 1, key: 'DARK' }
      });
    });
  });
});

