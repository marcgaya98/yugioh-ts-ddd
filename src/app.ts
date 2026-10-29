import path from 'path';
import express, { Express } from 'express';
import cors from 'cors';
import { buildDependencyContainer } from './infrastructure/di/container';
import { resolvePublicDirectory } from './infrastructure/services/local-image-storage.adapter';
import { createApiRouter } from './presentation/routes';
import { createCacheControlMiddleware } from './presentation/middlewares/cache-control.middleware';
import { webpRedirectMiddleware } from './presentation/middlewares/webp-redirect.middleware';
import { createImageCacheMiddleware } from './presentation/middlewares/image-cache.middleware';
import {
  errorHandlerMiddleware,
  notFoundHandlerMiddleware
} from './presentation/middlewares/error-handler.middleware';

export function createApp(): Express {
  const app = express();
  const controllers = buildDependencyContainer();
  const publicDir = resolvePublicDirectory();

  app.use(cors());
  app.use(express.json());

  app.use('/images/cards/normal', webpRedirectMiddleware);
  app.use('/images/cards/small', webpRedirectMiddleware);
  app.use('/images/cards/cropped', webpRedirectMiddleware);

  app.use(
    '/images',
    express.static(path.join(publicDir, 'images'), {
      maxAge: '1y',
      etag: true,
      lastModified: true,
      immutable: true
    })
  );

  app.use(
    express.static(publicDir, {
      maxAge: '1h',
      etag: true,
      lastModified: true
    })
  );

  app.use(createImageCacheMiddleware(controllers.imageStoragePort));

  app.use(createCacheControlMiddleware(3600));

  app.get('/', (_req, res) => {
    res.send('¡Servidor funcionando correctamente!');
  });

  app.use('/api', createApiRouter(controllers));

  app.use(notFoundHandlerMiddleware);
  app.use(errorHandlerMiddleware);

  return app;
}

const app = createApp();
export default app;
