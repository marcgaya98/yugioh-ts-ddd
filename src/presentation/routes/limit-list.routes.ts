import { Router } from 'express';
import { LimitListController } from '../controllers/limit-list/limit-list.controller';

export function createLimitListRoutes(controller: LimitListController): Router {
  const router = Router();

  router.get('/', (req, res, next) => controller.getAllLimitLists(req, res, next));
  router.get('/stats', (req, res, next) => controller.getAllLimitListsWithStats(req, res, next));
  router.get('/:listName/stats', (req, res, next) => controller.getLimitListStats(req, res, next));

  return router;
}

