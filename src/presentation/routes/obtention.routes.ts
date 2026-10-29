import { Router } from 'express';
import { PackController } from '../controllers/obtention/pack.controller';
import { ObtentionController } from '../controllers/obtention/obtention.controller';
import {
  validateIdParam,
  validateCardIdParam,
  validatePackIdParam,
  validateCharacterIdParam
} from '../middlewares/validate-params.middleware';

export function createPackRoutes(controller: PackController): Router {
  const router = Router();

  router.get('/', (req, res, next) => controller.getAllPacks(req, res, next));
  router.get('/:id', validateIdParam, (req, res, next) =>
    controller.getPackById(req, res, next)
  );
  router.get('/:id/cards', validateIdParam, (req, res, next) =>
    controller.getPackCards(req, res, next)
  );

  return router;
}

export function createObtentionRoutes(controller: ObtentionController): Router {
  const router = Router();

  router.get('/methods', (req, res, next) =>
    controller.getAllObtentionMethods(req, res, next)
  );
  router.get('/methods/:method/exclusive', (req, res, next) =>
    controller.getExclusiveCards(req, res, next)
  );
  router.get('/methods/:method', (req, res, next) =>
    controller.getCardsByMethod(req, res, next)
  );
  router.get('/cards/:cardId', validateCardIdParam, (req, res, next) =>
    controller.getCardAllObtentionMethods(req, res, next)
  );

  router.get('/packs', (req, res, next) => controller.getPackCards(req, res, next));
  router.get('/packs/:packId', validatePackIdParam, (req, res, next) =>
    controller.getPackCards(req, res, next)
  );
  router.get('/converter', (req, res, next) =>
    controller.getConverterCards(req, res, next)
  );
  router.get('/characters', (req, res, next) =>
    controller.getCharacterCards(req, res, next)
  );
  router.get('/characters/:characterId', validateCharacterIdParam, (req, res, next) =>
    controller.getCharacterCards(req, res, next)
  );
  router.get('/tutorials', (req, res, next) =>
    controller.getTutorialCards(req, res, next)
  );
  router.get('/tutorials/:day', (req, res, next) =>
    controller.getTutorialCards(req, res, next)
  );
  router.get('/initial-deck', (req, res, next) =>
    controller.getInitialDeckCards(req, res, next)
  );
  router.get('/sandwich', (req, res, next) =>
    controller.getSandwichCards(req, res, next)
  );
  router.get('/cards/:cardId/all', validateCardIdParam, (req, res, next) =>
    controller.getCardAllObtentionMethods(req, res, next)
  );

  return router;
}

