import { Request, Response, NextFunction } from 'express';

const DEFAULT_CACHE_DURATION_SECONDS = 3600;

export function createCacheControlMiddleware(durationInSeconds = DEFAULT_CACHE_DURATION_SECONDS) {
  return (request: Request, response: Response, next: NextFunction): void => {
    if (request.method === 'GET') {
      response.setHeader('Cache-Control', `public, max-age=${durationInSeconds}`);
    } else {
      response.setHeader('Cache-Control', 'no-store');
    }
    next();
  };
}

