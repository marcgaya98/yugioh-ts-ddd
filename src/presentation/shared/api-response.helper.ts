import { Response } from 'express';
import { HttpStatusCode } from '../../domain/shared/errors/domain.error';

export interface StandardApiResponse<T> {
  success: boolean;
  data?: T;
  meta?: Record<string, unknown>;
  error?: string;
}

export function sendSuccessResponse<T>(
  response: Response,
  payload: T,
  meta?: Record<string, unknown>,
  statusCode: HttpStatusCode = HttpStatusCode.OK
): Response {
  const body: StandardApiResponse<T> = {
    success: true,
    data: payload
  };

  if (meta !== undefined) {
    body.meta = meta;
  }

  return response.status(statusCode).json(body);
}

export function sendErrorResponse(
  response: Response,
  errorMessage: string,
  statusCode: HttpStatusCode = HttpStatusCode.INTERNAL_SERVER_ERROR
): Response {
  return response.status(statusCode).json({
    success: false,
    error: errorMessage
  });
}

