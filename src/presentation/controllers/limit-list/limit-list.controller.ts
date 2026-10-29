import { Request, Response, NextFunction } from 'express';
import { GetAllLimitListsUseCase } from '../../../application/limit-list/use-cases/get-all-limit-lists.use-case';
import { GetLimitListStatsUseCase } from '../../../application/limit-list/use-cases/get-limit-list-stats.use-case';
import { GetAllLimitListsWithStatsUseCase } from '../../../application/limit-list/use-cases/get-all-limit-lists-with-stats.use-case';
import { sendSuccessResponse } from '../../shared/api-response.helper';

export interface LimitListControllerDependencies {
  getAllLimitListsUseCase: GetAllLimitListsUseCase;
  getLimitListStatsUseCase: GetLimitListStatsUseCase;
  getAllLimitListsWithStatsUseCase: GetAllLimitListsWithStatsUseCase;
}

export class LimitListController {
  private readonly getAllLimitListsUseCase: GetAllLimitListsUseCase;
  private readonly getLimitListStatsUseCase: GetLimitListStatsUseCase;
  private readonly getAllLimitListsWithStatsUseCase: GetAllLimitListsWithStatsUseCase;

  constructor(dependencies: LimitListControllerDependencies) {
    this.getAllLimitListsUseCase = dependencies.getAllLimitListsUseCase;
    this.getLimitListStatsUseCase = dependencies.getLimitListStatsUseCase;
    this.getAllLimitListsWithStatsUseCase = dependencies.getAllLimitListsWithStatsUseCase;
  }

  public async getAllLimitLists(
    _request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const payload = await this.getAllLimitListsUseCase.execute();
      sendSuccessResponse(response, payload);
    } catch (error) {
      next(error);
    }
  }

  public async getLimitListStats(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const listName = String(request.params.listName);
      const payload = await this.getLimitListStatsUseCase.execute(listName);
      sendSuccessResponse(response, payload);
    } catch (error) {
      next(error);
    }
  }

  public async getAllLimitListsWithStats(
    _request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const payload = await this.getAllLimitListsWithStatsUseCase.execute();
      sendSuccessResponse(response, payload);
    } catch (error) {
      next(error);
    }
  }
}

