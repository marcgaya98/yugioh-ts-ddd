import { Request, Response, NextFunction } from 'express';
import {
  GetAllPacksUseCase,
  GetPackByIdUseCase,
  GetPackCardsUseCase
} from '../../../application/obtention/use-cases/pack.use-cases';
import { sendSuccessResponse } from '../../shared/api-response.helper';

export interface PackControllerDependencies {
  getAllPacksUseCase: GetAllPacksUseCase;
  getPackByIdUseCase: GetPackByIdUseCase;
  getPackCardsUseCase: GetPackCardsUseCase;
}

export class PackController {
  private readonly getAllPacksUseCase: GetAllPacksUseCase;
  private readonly getPackByIdUseCase: GetPackByIdUseCase;
  private readonly getPackCardsUseCase: GetPackCardsUseCase;

  constructor(dependencies: PackControllerDependencies) {
    this.getAllPacksUseCase = dependencies.getAllPacksUseCase;
    this.getPackByIdUseCase = dependencies.getPackByIdUseCase;
    this.getPackCardsUseCase = dependencies.getPackCardsUseCase;
  }

  public async getAllPacks(
    _request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const packs = await this.getAllPacksUseCase.execute();
      sendSuccessResponse(response, packs);
    } catch (error) {
      next(error);
    }
  }

  public async getPackById(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const packId = Number.parseInt(String(request.params.id), 10);
      const pack = await this.getPackByIdUseCase.execute(packId);
      sendSuccessResponse(response, pack);
    } catch (error) {
      next(error);
    }
  }

  public async getPackCards(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const packId = Number.parseInt(String(request.params.id), 10);
      const cards = await this.getPackCardsUseCase.execute(packId);
      sendSuccessResponse(response, cards);
    } catch (error) {
      next(error);
    }
  }
}

