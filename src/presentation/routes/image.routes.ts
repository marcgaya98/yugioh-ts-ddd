import { Router } from 'express';
import { ImageController } from '../controllers/media/image.controller';

export function createImageRoutes(controller: ImageController): Router {
  const router = Router();

  router.get('/stats', (req, res, next) => controller.getStats(req, res, next));
  router.get('/missing', (req, res, next) => controller.getMissingImages(req, res, next));
  router.post('/download', (req, res, next) => controller.startBulkDownload(req, res, next));
  router.delete('/cleanup', (req, res, next) => controller.cleanupOrphanImages(req, res, next));
  router.delete('/:type/:password', (req, res, next) => controller.deleteImage(req, res, next));

  return router;
}
