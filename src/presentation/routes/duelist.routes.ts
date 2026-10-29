import { Router } from 'express';
import { CharacterController } from '../controllers/duelist/character.controller';
import { DeckController } from '../controllers/duelist/deck.controller';
import {
  validateIdParam,
  validatePaginationParams
} from '../middlewares/validate-params.middleware';

export function createCharacterRoutes(controller: CharacterController): Router {
  const router = Router();

  router.get('/', validatePaginationParams, (req, res, next) =>
    controller.getAllCharacters(req, res, next)
  );
  router.get('/:id', validateIdParam, (req, res, next) =>
    controller.getCharacterById(req, res, next)
  );
  router.get('/:id/decks', validateIdParam, (req, res, next) =>
    controller.getCharacterDecks(req, res, next)
  );

  return router;
}

export function createDeckRoutes(controller: DeckController): Router {
  const router = Router();

  router.get('/', (req, res, next) => controller.getAllDecks(req, res, next));
  router.get('/:id', (req, res, next) => controller.getDeckById(req, res, next));
  router.get('/:id/cards', (req, res, next) =>
    controller.getDeckCards(req, res, next)
  );

  return router;
}

