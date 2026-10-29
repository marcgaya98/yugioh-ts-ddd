import { Request, Response, NextFunction } from 'express';
import { GetAllGenresUseCase } from '../../../application/catalog/use-cases/get-all-genres.use-case';
import { GetAllArchetypesUseCase } from '../../../application/catalog/use-cases/get-all-archetypes.use-case';
import { GetMonsterTypesUseCase } from '../../../application/catalog/use-cases/get-monster-types.use-case';
import { sendSuccessResponse } from '../../shared/api-response.helper';

export interface CatalogMetadataDependencies {
  getAllGenresUseCase: GetAllGenresUseCase;
  getAllArchetypesUseCase: GetAllArchetypesUseCase;
  getMonsterTypesUseCase: GetMonsterTypesUseCase;
}

export class CatalogMetadataController {
  private readonly getAllGenresUseCase: GetAllGenresUseCase;
  private readonly getAllArchetypesUseCase: GetAllArchetypesUseCase;
  private readonly getMonsterTypesUseCase: GetMonsterTypesUseCase;

  constructor(dependencies: CatalogMetadataDependencies) {
    this.getAllGenresUseCase = dependencies.getAllGenresUseCase;
    this.getAllArchetypesUseCase = dependencies.getAllArchetypesUseCase;
    this.getMonsterTypesUseCase = dependencies.getMonsterTypesUseCase;
  }

  public async getAllGenres(
    _request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const genres = await this.getAllGenresUseCase.execute();
      sendSuccessResponse(response, genres);
    } catch (error) {
      next(error);
    }
  }

  public async getAllArchetypes(
    _request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const archetypes = await this.getAllArchetypesUseCase.execute();
      sendSuccessResponse(response, archetypes);
    } catch (error) {
      next(error);
    }
  }

  public getAllMonsterTypes(
    _request: Request,
    response: Response,
    next: NextFunction
  ): void {
    try {
      const types = this.getMonsterTypesUseCase.execute();
      sendSuccessResponse(response, types);
    } catch (error) {
      next(error);
    }
  }
}

