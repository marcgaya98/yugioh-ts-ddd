import { Router } from 'express';
import { AppControllers } from '../../infrastructure/di/container';
import {
  createCardRoutes,
  createGenreRoutes,
  createArchetypeRoutes,
  createTypeRoutes
} from './catalog.routes';
import { createLimitListRoutes } from './limit-list.routes';
import { createPackRoutes, createObtentionRoutes } from './obtention.routes';
import { createCharacterRoutes, createDeckRoutes } from './duelist.routes';
import { createGameStatsRoutes, createIconRoutes } from './game-stats.routes';
import { createImageRoutes } from './image.routes';
import { createSemanticSearchRoutes } from './ai-search.routes';

export function createApiRouter(controllers: AppControllers): Router {
  const router = Router();

  router.use('/cards', createCardRoutes(controllers.cardController));
  router.use('/genres', createGenreRoutes(controllers.catalogMetadataController));
  router.use('/archetypes', createArchetypeRoutes(controllers.catalogMetadataController));
  router.use('/types', createTypeRoutes(controllers.catalogMetadataController));
  router.use('/limit-lists', createLimitListRoutes(controllers.limitListController));
  router.use('/packs', createPackRoutes(controllers.packController));
  router.use('/obtentions', createObtentionRoutes(controllers.obtentionController));
  router.use('/characters', createCharacterRoutes(controllers.characterController));
  router.use('/decks', createDeckRoutes(controllers.deckController));
  router.use('/game-stats', createGameStatsRoutes(controllers.gameStatsController));
  router.use('/icons', createIconRoutes(controllers.iconController));
  router.use('/images', createImageRoutes(controllers.imageController));
  router.use(
    '/semantic-search',
    createSemanticSearchRoutes(controllers.semanticSearchController)
  );

  return router;
}
