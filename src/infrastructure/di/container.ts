import path from 'path';
import { setupModelAssociations } from '../persistence/models/associations';
import { SequelizeCardRepository } from '../persistence/repositories/catalog/sequelize-card.repository';
import { SequelizeGenreRepository } from '../persistence/repositories/catalog/sequelize-genre.repository';
import { SequelizeLimitListRepository } from '../persistence/repositories/limit-list/sequelize-limit-list.repository';
import { SequelizePackRepository } from '../persistence/repositories/obtention/sequelize-pack.repository';
import { SequelizeObtentionRepository } from '../persistence/repositories/obtention/sequelize-obtention.repository';
import { SequelizeCharacterRepository } from '../persistence/repositories/duelist/sequelize-character.repository';
import { SequelizeDeckRepository } from '../persistence/repositories/duelist/sequelize-deck.repository';
import {
  SequelizeGameStatsRepository,
  SequelizeIconRepository
} from '../persistence/repositories/game-stats/sequelize-game-stats.repository';
import { SequelizeCardEmbeddingRepository } from '../persistence/repositories/ai-search/sequelize-card-embedding.repository';
import { SequelizeCardImageMetadataRepository } from '../persistence/repositories/media/sequelize-card-image-metadata.repository';
import {
  LocalImageStorageAdapter,
  resolvePublicDirectory
} from '../services/local-image-storage.adapter';
import { XenovaClipVisionAdapter } from '../services/xenova-clip-vision.adapter';
import { ImageStoragePort } from '../../domain/media/repositories/image-storage.port';

import { SearchCardsUseCase } from '../../application/catalog/use-cases/search-cards.use-case';
import { GetCardByIdUseCase } from '../../application/catalog/use-cases/get-card-by-id.use-case';
import { GetAllGenresUseCase } from '../../application/catalog/use-cases/get-all-genres.use-case';
import { GetAllArchetypesUseCase } from '../../application/catalog/use-cases/get-all-archetypes.use-case';
import { GetMonsterTypesUseCase } from '../../application/catalog/use-cases/get-monster-types.use-case';
import { GetAllLimitListsUseCase } from '../../application/limit-list/use-cases/get-all-limit-lists.use-case';
import { GetLimitListStatsUseCase } from '../../application/limit-list/use-cases/get-limit-list-stats.use-case';
import { GetAllLimitListsWithStatsUseCase } from '../../application/limit-list/use-cases/get-all-limit-lists-with-stats.use-case';
import {
  GetAllPacksUseCase,
  GetPackByIdUseCase,
  GetPackCardsUseCase
} from '../../application/obtention/use-cases/pack.use-cases';
import { ObtentionUseCases } from '../../application/obtention/use-cases/obtention.use-cases';
import {
  GetAllCharactersUseCase,
  GetCharacterByIdUseCase,
  GetCharacterDecksUseCase
} from '../../application/duelist/use-cases/character.use-cases';
import {
  GetAllDecksUseCase,
  GetDeckByIdUseCase,
  GetDeckCardsUseCase
} from '../../application/duelist/use-cases/deck.use-cases';
import {
  GameStatsUseCases,
  IconUseCases
} from '../../application/game-stats/use-cases/game-stats.use-cases';
import {
  CleanupOrphanImagesUseCase,
  DeleteCardImageUseCase,
  GetImageStorageStatsUseCase,
  GetMissingCardImagesUseCase,
  StartBulkImageDownloadUseCase
} from '../../application/media/use-cases/image-stats.use-case';
import {
  FindSimilarCardsByClipUseCase,
  GetSemanticSearchStatsUseCase,
  RunSemanticSearchTestSuiteUseCase,
  SearchByVisualDescriptionUseCase,
  SearchByVisualStyleUseCase,
  StartClipEmbeddingsGenerationUseCase
} from '../../application/ai-search/use-cases/semantic-search.use-cases';

import { CardController } from '../../presentation/controllers/catalog/card.controller';
import { CatalogMetadataController } from '../../presentation/controllers/catalog/catalog-metadata.controller';
import { LimitListController } from '../../presentation/controllers/limit-list/limit-list.controller';
import { PackController } from '../../presentation/controllers/obtention/pack.controller';
import { ObtentionController } from '../../presentation/controllers/obtention/obtention.controller';
import { CharacterController } from '../../presentation/controllers/duelist/character.controller';
import { DeckController } from '../../presentation/controllers/duelist/deck.controller';
import {
  GameStatsController,
  IconController
} from '../../presentation/controllers/game-stats/game-stats.controller';
import { ImageController } from '../../presentation/controllers/media/image.controller';
import { SemanticSearchController } from '../../presentation/controllers/ai-search/semantic-search.controller';

export interface AppControllers {
  cardController: CardController;
  catalogMetadataController: CatalogMetadataController;
  limitListController: LimitListController;
  packController: PackController;
  obtentionController: ObtentionController;
  characterController: CharacterController;
  deckController: DeckController;
  gameStatsController: GameStatsController;
  iconController: IconController;
  imageController: ImageController;
  semanticSearchController: SemanticSearchController;
  imageStoragePort: ImageStoragePort;
}

function buildSemanticSearchController(): SemanticSearchController {
  const cardEmbeddingRepository = new SequelizeCardEmbeddingRepository();
  const clipVisionAdapter = new XenovaClipVisionAdapter();
  const croppedImagesDir = path.join(resolvePublicDirectory(), 'images', 'cards', 'cropped');

  return new SemanticSearchController({
    searchByVisualDescriptionUseCase: new SearchByVisualDescriptionUseCase(cardEmbeddingRepository),
    searchByVisualStyleUseCase: new SearchByVisualStyleUseCase(cardEmbeddingRepository),
    findSimilarCardsByClipUseCase: new FindSimilarCardsByClipUseCase(cardEmbeddingRepository),
    getSemanticSearchStatsUseCase: new GetSemanticSearchStatsUseCase(cardEmbeddingRepository),
    runSemanticSearchTestSuiteUseCase: new RunSemanticSearchTestSuiteUseCase(cardEmbeddingRepository),
    startClipEmbeddingsGenerationUseCase: new StartClipEmbeddingsGenerationUseCase(
      cardEmbeddingRepository,
      clipVisionAdapter,
      croppedImagesDir
    )
  });
}

function buildImageController(imageStorageAdapter: LocalImageStorageAdapter): ImageController {
  const cardImageMetadataRepository = new SequelizeCardImageMetadataRepository();

  return new ImageController({
    getImageStorageStatsUseCase: new GetImageStorageStatsUseCase(imageStorageAdapter),
    deleteCardImageUseCase: new DeleteCardImageUseCase(imageStorageAdapter),
    cleanupOrphanImagesUseCase: new CleanupOrphanImagesUseCase(
      imageStorageAdapter,
      cardImageMetadataRepository
    ),
    getMissingCardImagesUseCase: new GetMissingCardImagesUseCase(
      imageStorageAdapter,
      cardImageMetadataRepository
    ),
    startBulkImageDownloadUseCase: new StartBulkImageDownloadUseCase(
      imageStorageAdapter,
      cardImageMetadataRepository
    )
  });
}

export function buildDependencyContainer(): AppControllers {
  setupModelAssociations();

  const cardRepository = new SequelizeCardRepository();
  const genreRepository = new SequelizeGenreRepository();
  const limitListRepository = new SequelizeLimitListRepository();
  const packRepository = new SequelizePackRepository();
  const obtentionRepository = new SequelizeObtentionRepository();
  const characterRepository = new SequelizeCharacterRepository();
  const deckRepository = new SequelizeDeckRepository();
  const gameStatsRepository = new SequelizeGameStatsRepository();
  const iconRepository = new SequelizeIconRepository();
  const imageStorageAdapter = new LocalImageStorageAdapter();

  return {
    cardController: new CardController(
      new SearchCardsUseCase(cardRepository, limitListRepository),
      new GetCardByIdUseCase(cardRepository)
    ),
    catalogMetadataController: new CatalogMetadataController({
      getAllGenresUseCase: new GetAllGenresUseCase(genreRepository),
      getAllArchetypesUseCase: new GetAllArchetypesUseCase(cardRepository),
      getMonsterTypesUseCase: new GetMonsterTypesUseCase(cardRepository)
    }),
    limitListController: new LimitListController({
      getAllLimitListsUseCase: new GetAllLimitListsUseCase(limitListRepository),
      getLimitListStatsUseCase: new GetLimitListStatsUseCase(limitListRepository),
      getAllLimitListsWithStatsUseCase: new GetAllLimitListsWithStatsUseCase(limitListRepository)
    }),
    packController: new PackController({
      getAllPacksUseCase: new GetAllPacksUseCase(packRepository),
      getPackByIdUseCase: new GetPackByIdUseCase(packRepository),
      getPackCardsUseCase: new GetPackCardsUseCase(packRepository)
    }),
    obtentionController: new ObtentionController(new ObtentionUseCases(obtentionRepository)),
    characterController: new CharacterController({
      getAllCharactersUseCase: new GetAllCharactersUseCase(characterRepository),
      getCharacterByIdUseCase: new GetCharacterByIdUseCase(characterRepository),
      getCharacterDecksUseCase: new GetCharacterDecksUseCase(characterRepository)
    }),
    deckController: new DeckController({
      getAllDecksUseCase: new GetAllDecksUseCase(deckRepository),
      getDeckByIdUseCase: new GetDeckByIdUseCase(deckRepository),
      getDeckCardsUseCase: new GetDeckCardsUseCase(deckRepository)
    }),
    gameStatsController: new GameStatsController(new GameStatsUseCases(gameStatsRepository)),
    iconController: new IconController(new IconUseCases(iconRepository)),
    imageController: buildImageController(imageStorageAdapter),
    semanticSearchController: buildSemanticSearchController(),
    imageStoragePort: imageStorageAdapter
  };
}
