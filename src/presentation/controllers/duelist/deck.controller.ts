import { Request, Response, NextFunction } from 'express';
import {
  GetAllDecksUseCase,
  GetDeckByIdUseCase,
  GetDeckCardsUseCase
} from '../../../application/duelist/use-cases/deck.use-cases';
import { DeckSearchFilters } from '../../../domain/duelist/entities/deck.entity';
import { sendSuccessResponse } from '../../shared/api-response.helper';

export interface DeckControllerDependencies {
  getAllDecksUseCase: GetAllDecksUseCase;
  getDeckByIdUseCase: GetDeckByIdUseCase;
  getDeckCardsUseCase: GetDeckCardsUseCase;
}

export class DeckController {
  private readonly getAllDecksUseCase: GetAllDecksUseCase;
  private readonly getDeckByIdUseCase: GetDeckByIdUseCase;
  private readonly getDeckCardsUseCase: GetDeckCardsUseCase;

  constructor(dependencies: DeckControllerDependencies) {
    this.getAllDecksUseCase = dependencies.getAllDecksUseCase;
    this.getDeckByIdUseCase = dependencies.getDeckByIdUseCase;
    this.getDeckCardsUseCase = dependencies.getDeckCardsUseCase;
  }

  public async getAllDecks(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const filters: DeckSearchFilters = {
        name: request.query.name ? String(request.query.name) : undefined,
        level: request.query.level
          ? Number.parseInt(String(request.query.level), 10)
          : undefined,
        characterId: request.query.characterId
          ? Number.parseInt(String(request.query.characterId), 10)
          : undefined
      };
      const decks = await this.getAllDecksUseCase.execute(filters);
      sendSuccessResponse(response, decks);
    } catch (error) {
      next(error);
    }
  }

  public async getDeckById(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const deckId = String(request.params.id);
      const deck = await this.getDeckByIdUseCase.execute(deckId);
      sendSuccessResponse(response, deck);
    } catch (error) {
      next(error);
    }
  }

  public async getDeckCards(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const deckId = String(request.params.id);
      const cards = await this.getDeckCardsUseCase.execute(deckId);
      sendSuccessResponse(response, cards);
    } catch (error) {
      next(error);
    }
  }
}

