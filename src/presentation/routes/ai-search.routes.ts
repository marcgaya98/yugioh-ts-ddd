import { Router } from 'express';
import { SemanticSearchController } from '../controllers/ai-search/semantic-search.controller';

export function createSemanticSearchRoutes(controller: SemanticSearchController): Router {
  const router = Router();

  router.get('/', (req, res, next) => controller.searchByVisualDescription(req, res, next));
  router.get('/style', (req, res, next) => controller.searchByStyle(req, res, next));
  router.get('/similar/:cardId', (req, res, next) =>
    controller.findSimilarCards(req, res, next)
  );
  router.get('/stats', (req, res, next) => controller.getSemanticSearchStats(req, res, next));
  router.post('/generate-embeddings', (req, res, next) =>
    controller.generateClipEmbeddings(req, res, next)
  );
  router.get('/test', (req, res, next) => controller.testSemanticSearch(req, res, next));

  return router;
}
