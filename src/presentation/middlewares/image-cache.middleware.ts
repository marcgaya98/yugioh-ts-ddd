import fs from 'fs';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import {
  ImageStoragePort,
  ImageVariantType,
  VALID_IMAGE_TYPES
} from '../../domain/media/repositories/image-storage.port';
import { CardPassword } from '../../domain/shared/value-objects/card-password.value-object';

const IMAGE_ROUTE_REGEX = /^\/images\/cards\/([^/]+)\/(\d+)\.jpg$/;
const ONE_YEAR_CACHE_CONTROL = 'public, max-age=31536000, immutable';

function isValidImageVariant(value: string): value is ImageVariantType {
  return (VALID_IMAGE_TYPES as readonly string[]).includes(value);
}

export function createImageCacheMiddleware(imageStoragePort: ImageStoragePort): RequestHandler {
  return async (request: Request, response: Response, next: NextFunction): Promise<void> => {
    const match = request.path.match(IMAGE_ROUTE_REGEX);
    if (!match) {
      next();
      return;
    }

    const [, variant, rawPassword] = match;
    if (!isValidImageVariant(variant)) {
      response.status(400).json({
        success: false,
        error: 'Tipo de imagen inválido',
        validTypes: VALID_IMAGE_TYPES
      });
      return;
    }

    const passwordVo = CardPassword.createOptional(rawPassword);
    if (!passwordVo) {
      response.status(400).json({
        success: false,
        error: 'Password de carta inválido'
      });
      return;
    }

    const normalizedPassword = passwordVo.getNormalizedForUrl();
    const localPath = imageStoragePort.resolveLocalJpgPath(variant, normalizedPassword);

    try {
      if (!fs.existsSync(localPath)) {
        await imageStoragePort.downloadCardImageOnDemand(variant, normalizedPassword);
      }

      if (!fs.existsSync(localPath)) {
        response.status(404).json({
          success: false,
          error: 'Imagen no disponible'
        });
        return;
      }

      serveCachedImageFile(request, response, localPath);
    } catch (error) {
      response.status(404).json({
        success: false,
        error: 'Imagen no disponible',
        message: error instanceof Error ? error.message : 'Download error'
      });
    }
  };
}

function serveCachedImageFile(
  request: Request,
  response: Response,
  localPath: string
): void {
  const stats = fs.statSync(localPath);
  const serverETag = `"${stats.mtime.getTime()}-${stats.size}"`;

  response.set({
    'Cache-Control': ONE_YEAR_CACHE_CONTROL,
    ETag: serverETag,
    'Last-Modified': stats.mtime.toUTCString(),
    'Content-Type': 'image/jpeg',
    'Content-Length': String(stats.size)
  });

  if (request.get('If-None-Match') === serverETag) {
    response.status(304).end();
    return;
  }

  response.sendFile(localPath);
}
