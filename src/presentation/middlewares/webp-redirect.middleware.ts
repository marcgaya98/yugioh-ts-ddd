import { existsSync } from 'fs';
import { join } from 'path';
import { Request, Response, NextFunction } from 'express';

const CARD_IMAGE_PATH_REGEX = /^\/images\/cards\/(normal|small|cropped)\/(.+)\.jpg$/;

export function webpRedirectMiddleware(
  request: Request,
  _response: Response,
  next: NextFunction
): void {
  if (!request.accepts('image/webp')) {
    next();
    return;
  }

  const match = request.path.match(CARD_IMAGE_PATH_REGEX);
  if (!match) {
    next();
    return;
  }

  const [, imageVariant, filename] = match;
  const webpRelativeUrl = `/images/cards/${imageVariant}_webp/${filename}.webp`;
  const webpDiskPath = join(
    process.cwd(),
    'public',
    'images',
    'cards',
    `${imageVariant}_webp`,
    `${filename}.webp`
  );

  if (existsSync(webpDiskPath)) {
    request.url = webpRelativeUrl;
  }

  next();
}

