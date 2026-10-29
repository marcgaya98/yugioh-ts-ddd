import { Request, Response } from 'express';
import {
  validateIdParam,
  validatePaginationParams
} from '../../src/presentation/middlewares/validate-params.middleware';
import {
  errorHandlerMiddleware,
  notFoundHandlerMiddleware
} from '../../src/presentation/middlewares/error-handler.middleware';
import {
  EntityNotFoundError,
  InvalidParameterError
} from '../../src/domain/shared/errors/domain.error';
import { LocalImageStorageAdapter } from '../../src/infrastructure/services/local-image-storage.adapter';
import { GetImageStorageStatsUseCase } from '../../src/application/media/use-cases/image-stats.use-case';
import { ImageController } from '../../src/presentation/controllers/media/image.controller';

function createMockResponse(): Response {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  return res as Response;
}

describe('Presentation Layer: Middlewares & Standardized Responses', () => {
  describe('Parameter Validation Middlewares', () => {
    it('rejects non-numeric and negative IDs with InvalidParameterError', () => {
      const nextAbc = jest.fn();
      validateIdParam(
        { params: { id: 'abc' } } as unknown as Request,
        createMockResponse(),
        nextAbc
      );
      expect(nextAbc).toHaveBeenCalledWith(expect.any(InvalidParameterError));

      const nextNeg = jest.fn();
      validateIdParam(
        { params: { id: '-1' } } as unknown as Request,
        createMockResponse(),
        nextNeg
      );
      expect(nextNeg).toHaveBeenCalledWith(expect.any(InvalidParameterError));

      const nextValid = jest.fn();
      validateIdParam(
        { params: { id: '42' } } as unknown as Request,
        createMockResponse(),
        nextValid
      );
      expect(nextValid).toHaveBeenCalledWith();
    });

    it('validates pagination query parameters', () => {
      const nextInvalidLimit = jest.fn();
      validatePaginationParams(
        { query: { limit: '0' } } as unknown as Request,
        createMockResponse(),
        nextInvalidLimit
      );
      expect(nextInvalidLimit).toHaveBeenCalledWith(expect.any(InvalidParameterError));

      const nextInvalidOffset = jest.fn();
      validatePaginationParams(
        { query: { offset: '-5' } } as unknown as Request,
        createMockResponse(),
        nextInvalidOffset
      );
      expect(nextInvalidOffset).toHaveBeenCalledWith(expect.any(InvalidParameterError));
    });
  });

  describe('Global Error Handler & 404 Handler', () => {
    it('maps EntityNotFoundError to 404 with { success: false, error }', () => {
      const res = createMockResponse();
      errorHandlerMiddleware(
        new EntityNotFoundError('Card'),
        {} as Request,
        res,
        jest.fn()
      );
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Card not found'
      });
    });

    it('maps InvalidParameterError to 400 with { success: false, error }', () => {
      const res = createMockResponse();
      errorHandlerMiddleware(
        new InvalidParameterError('Invalid id parameter. Must be a positive integer.'),
        {} as Request,
        res,
        jest.fn()
      );
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid id parameter. Must be a positive integer.'
      });
    });

    it('formats 404 route not found consistently', () => {
      const res = createMockResponse();
      notFoundHandlerMiddleware({ originalUrl: '/api/unknown' } as Request, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Route not found: /api/unknown'
      });
    });
  });

  describe('ImageController (/api/images/stats)', () => {
    it('returns image storage statistics with both standardized and root fields', () => {
      const adapter = new LocalImageStorageAdapter();
      const useCase = new GetImageStorageStatsUseCase(adapter);
      const controller = new ImageController(useCase);
      const res = createMockResponse();

      controller.getStats({} as Request, res, jest.fn());

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            imageTypes: ['normal', 'small', 'cropped']
          }),
          imageTypes: ['normal', 'small', 'cropped'],
          normalCount: expect.any(Number),
          smallCount: expect.any(Number),
          croppedCount: expect.any(Number)
        })
      );
    });
  });
});

