import { Router } from 'express';
import { CardController } from '../controllers/catalog/card.controller';
import { CatalogMetadataController } from '../controllers/catalog/catalog-metadata.controller';
import {
  validateIdParam,
  validatePaginationParams
} from '../middlewares/validate-params.middleware';

export function createCardRoutes(controller: CardController): Router {
  const router = Router();

  router.get('/', validatePaginationParams, (req, res, next) =>
    controller.getAllCards(req, res, next)
  );
  router.get('/:id', validateIdParam, (req, res, next) =>
    controller.getCardById(req, res, next)
  );

  return router;
}

export function createGenreRoutes(controller: CatalogMetadataController): Router {
  const router = Router();
  router.get('/', (req, res, next) => controller.getAllGenres(req, res, next));
  return router;
}

export function createArchetypeRoutes(controller: CatalogMetadataController): Router {
  const router = Router();
  router.get('/', (req, res, next) => controller.getAllArchetypes(req, res, next));
  return router;
}

export function createTypeRoutes(controller: CatalogMetadataController): Router {
  const router = Router();
  router.get('/', (req, res, next) => controller.getAllMonsterTypes(req, res, next));
  return router;
}

