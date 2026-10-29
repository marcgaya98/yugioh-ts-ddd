import { Request, Response, NextFunction } from 'express';
import { ObtentionUseCases } from '../../../application/obtention/use-cases/obtention.use-cases';
import { sendSuccessResponse } from '../../shared/api-response.helper';

export class ObtentionController {
  constructor(private readonly obtentionUseCases: ObtentionUseCases) {}

  public async getAllObtentionMethods(
    _request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const methods = await this.obtentionUseCases.getAllMethodsSummary();
      sendSuccessResponse(response, methods);
    } catch (error) {
      next(error);
    }
  }

  public async getCardsByMethod(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const method = String(request.params.method);
      const result = await this.obtentionUseCases.getCardsByLegacyMethod(method);
      if ('cards' in result && 'meta' in result) {
        sendSuccessResponse(response, result.cards, result.meta);
        return;
      }
      sendSuccessResponse(response, result);
    } catch (error) {
      next(error);
    }
  }

  public async getExclusiveCards(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const method = String(request.params.method);
      const result = await this.obtentionUseCases.getExclusiveCards(method);
      sendSuccessResponse(response, result.cards, result.meta);
    } catch (error) {
      next(error);
    }
  }

  public async getConverterCards(
    _request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const cards = await this.obtentionUseCases.getConverterCards();
      sendSuccessResponse(response, cards);
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
      const packId = request.params.packId
        ? Number.parseInt(String(request.params.packId), 10)
        : undefined;
      const cards = await this.obtentionUseCases.getPackCards(packId);
      sendSuccessResponse(response, cards);
    } catch (error) {
      next(error);
    }
  }

  public async getCharacterCards(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const characterId = request.params.characterId
        ? Number.parseInt(String(request.params.characterId), 10)
        : undefined;
      const cards = await this.obtentionUseCases.getCharacterCards(characterId);
      sendSuccessResponse(response, cards);
    } catch (error) {
      next(error);
    }
  }

  public async getTutorialCards(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const day = request.params.day ? String(request.params.day) : undefined;
      const cards = await this.obtentionUseCases.getTutorialCards(day);
      sendSuccessResponse(response, cards);
    } catch (error) {
      next(error);
    }
  }

  public async getInitialDeckCards(
    _request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await this.obtentionUseCases.getInitialDeckCards();
      sendSuccessResponse(response, result.cards, result.meta);
    } catch (error) {
      next(error);
    }
  }

  public async getSandwichCards(
    _request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const cards = await this.obtentionUseCases.getSandwichCards();
      sendSuccessResponse(response, cards);
    } catch (error) {
      next(error);
    }
  }

  public async getCardAllObtentionMethods(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const cardId = Number.parseInt(String(request.params.cardId), 10);
      const result = await this.obtentionUseCases.getCardAllObtentionMethods(cardId);
      sendSuccessResponse(response, result);
    } catch (error) {
      next(error);
    }
  }
}

