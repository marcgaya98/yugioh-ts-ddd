import { Router } from 'express';
import {
  GameStatsController,
  IconController
} from '../controllers/game-stats/game-stats.controller';
import { validateIdParam } from '../middlewares/validate-params.middleware';

export function createGameStatsRoutes(controller: GameStatsController): Router {
  const router = Router();

  router.get('/bonus', (req, res, next) => controller.getAllBonuses(req, res, next));
  router.get('/bonus/category/:category', (req, res, next) =>
    controller.getBonusesByCategory(req, res, next)
  );
  router.get('/bonus/:id', validateIdParam, (req, res, next) =>
    controller.getBonusById(req, res, next)
  );

  router.get('/challenge', (req, res, next) =>
    controller.getAllChallenges(req, res, next)
  );
  router.get('/challenge/category/:category', (req, res, next) =>
    controller.getChallengesByCategory(req, res, next)
  );
  router.get('/challenge/:id', validateIdParam, (req, res, next) =>
    controller.getChallengeById(req, res, next)
  );

  router.get('/high-score', (req, res, next) =>
    controller.getAllHighScores(req, res, next)
  );
  router.get('/high-score/category/:category', (req, res, next) =>
    controller.getHighScoresByCategory(req, res, next)
  );
  router.get('/high-score/:id', validateIdParam, (req, res, next) =>
    controller.getHighScoreById(req, res, next)
  );

  return router;
}

export function createIconRoutes(controller: IconController): Router {
  const router = Router();

  router.get('/', (req, res, next) => controller.getAllIcons(req, res, next));
  router.get('/category/:category', (req, res, next) =>
    controller.getIconsByCategory(req, res, next)
  );
  router.get('/category/:category/:key', (req, res, next) =>
    controller.getIconByKey(req, res, next)
  );
  router.get('/specific/:category/:key', (req, res, next) =>
    controller.getIconByKey(req, res, next)
  );

  return router;
}

