import { Request, Response, NextFunction } from 'express';
import { InvalidParameterError } from '../../domain/shared/errors/domain.error';

const POSITIVE_INTEGER_REGEX = /^[1-9]\d*$/;

export function validatePositiveIntegerParam(paramName: string) {
  return (request: Request, _response: Response, next: NextFunction): void => {
    const rawValue = request.params[paramName];
    if (!rawValue || !POSITIVE_INTEGER_REGEX.test(String(rawValue))) {
      next(new InvalidParameterError(`Invalid ${paramName} parameter. Must be a positive integer.`));
      return;
    }
    next();
  };
}

export const validateIdParam = validatePositiveIntegerParam('id');
export const validateCardIdParam = validatePositiveIntegerParam('cardId');
export const validatePackIdParam = validatePositiveIntegerParam('packId');
export const validateCharacterIdParam = validatePositiveIntegerParam('characterId');

export function validatePaginationParams(
  request: Request,
  _response: Response,
  next: NextFunction
): void {
  const { limit, offset } = request.query;

  if (limit !== undefined && (Number.isNaN(Number(limit)) || Number(limit) < 1)) {
    next(new InvalidParameterError('Invalid limit parameter. Must be a positive number.'));
    return;
  }

  if (offset !== undefined && (Number.isNaN(Number(offset)) || Number(offset) < 0)) {
    next(new InvalidParameterError('Invalid offset parameter. Must be a non-negative number.'));
    return;
  }

  next();
}
