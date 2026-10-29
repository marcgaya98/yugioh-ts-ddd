import { Request, Response, NextFunction } from 'express';
import { SearchCardsUseCase } from '../../../application/catalog/use-cases/search-cards.use-case';
import { GetCardByIdUseCase } from '../../../application/catalog/use-cases/get-card-by-id.use-case';
import { buildCardSearchCriteriaFromQuery } from '../../../domain/catalog/value-objects/card-search-criteria.value-object';
import { sendSuccessResponse } from '../../shared/api-response.helper';

export class CardController {
  constructor(
    private readonly searchCardsUseCase: SearchCardsUseCase,
    private readonly getCardByIdUseCase: GetCardByIdUseCase
  ) {}

  public async getAllCards(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const criteria = buildCardSearchCriteriaFromQuery(
        request.query as Record<string, unknown>
      );
      const paginatedResult = await this.searchCardsUseCase.execute(criteria);
      sendSuccessResponse(response, paginatedResult);
    } catch (error) {
      next(error);
    }
  }

  public async getCardById(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const cardId = Number.parseInt(String(request.params.id), 10);
      const baseUrl = `${request.protocol}://${request.get('host')}`;
      const cardDetail = await this.getCardByIdUseCase.execute(cardId, baseUrl);
      sendSuccessResponse(response, cardDetail);
    } catch (error) {
      next(error);
    }
  }
}

