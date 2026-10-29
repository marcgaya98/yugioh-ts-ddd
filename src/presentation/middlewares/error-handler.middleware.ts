import { Request, Response, NextFunction } from 'express';
import { DomainError, HttpStatusCode } from '../../domain/shared/errors/domain.error';
import { sendErrorResponse } from '../shared/api-response.helper';

export function errorHandlerMiddleware(
  error: Error,
  _request: Request,
  response: Response,
  _next: NextFunction
): void {
  if (error instanceof DomainError) {
    sendErrorResponse(response, error.message, error.statusCode);
    return;
  }

  const message = error.message || 'Internal Server Error';
  sendErrorResponse(response, message, HttpStatusCode.INTERNAL_SERVER_ERROR);
}

export function notFoundHandlerMiddleware(request: Request, response: Response): void {
  sendErrorResponse(
    response,
    `Route not found: ${request.originalUrl}`,
    HttpStatusCode.NOT_FOUND
  );
}

