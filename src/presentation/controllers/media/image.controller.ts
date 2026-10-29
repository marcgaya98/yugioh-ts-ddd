import { Request, Response, NextFunction } from 'express';
import {
  CleanupOrphanImagesUseCase,
  DeleteCardImageUseCase,
  GetImageStorageStatsUseCase,
  GetMissingCardImagesUseCase,
  StartBulkImageDownloadUseCase
} from '../../../application/media/use-cases/image-stats.use-case';
import { sendSuccessResponse } from '../../shared/api-response.helper';

export interface ImageControllerDependencies {
  getImageStorageStatsUseCase: GetImageStorageStatsUseCase;
  deleteCardImageUseCase?: DeleteCardImageUseCase;
  cleanupOrphanImagesUseCase?: CleanupOrphanImagesUseCase;
  getMissingCardImagesUseCase?: GetMissingCardImagesUseCase;
  startBulkImageDownloadUseCase?: StartBulkImageDownloadUseCase;
}

export class ImageController {
  private readonly deps: ImageControllerDependencies;

  constructor(
    depsOrStatsUseCase: GetImageStorageStatsUseCase | ImageControllerDependencies
  ) {
    if (depsOrStatsUseCase instanceof GetImageStorageStatsUseCase) {
      this.deps = { getImageStorageStatsUseCase: depsOrStatsUseCase };
    } else {
      this.deps = depsOrStatsUseCase;
    }
  }

  public getStats(_request: Request, response: Response, next: NextFunction): void {
    try {
      const stats = this.deps.getImageStorageStatsUseCase.execute();
      response.status(200).json({
        success: true,
        data: stats,
        ...stats
      });
    } catch (error) {
      next(error);
    }
  }

  public async getMissingImages(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!this.deps.getMissingCardImagesUseCase) {
        return;
      }

      const limit = request.query.limit
        ? Number.parseInt(String(request.query.limit), 10)
        : undefined;
      const offset = request.query.offset
        ? Number.parseInt(String(request.query.offset), 10)
        : undefined;
      const type = request.query.type ? String(request.query.type) : undefined;
      const format = request.query.format ? String(request.query.format) : undefined;

      const result = await this.deps.getMissingCardImagesUseCase.execute({
        limit,
        offset,
        type,
        format
      });
      sendSuccessResponse(response, result);
    } catch (error) {
      next(error);
    }
  }

  public deleteImage(request: Request, response: Response, next: NextFunction): void {
    try {
      if (!this.deps.deleteCardImageUseCase) {
        return;
      }

      const { type, password } = request.params;
      const result = this.deps.deleteCardImageUseCase.execute(type, password);
      sendSuccessResponse(response, {
        message: 'Imagen(es) eliminada(s) correctamente',
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  public async cleanupOrphanImages(
    _request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!this.deps.cleanupOrphanImagesUseCase) {
        return;
      }

      const result = await this.deps.cleanupOrphanImagesUseCase.execute();
      sendSuccessResponse(response, {
        message: 'Limpieza de imágenes completada',
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  public startBulkDownload(
    _request: Request,
    response: Response,
    next: NextFunction
  ): void {
    try {
      if (!this.deps.startBulkImageDownloadUseCase) {
        return;
      }

      const result = this.deps.startBulkImageDownloadUseCase.execute();
      sendSuccessResponse(response, result);
    } catch (error) {
      next(error);
    }
  }
}
