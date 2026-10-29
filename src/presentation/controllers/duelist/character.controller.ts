import { Request, Response, NextFunction } from 'express';
import {
  GetAllCharactersUseCase,
  GetCharacterByIdUseCase,
  GetCharacterDecksUseCase
} from '../../../application/duelist/use-cases/character.use-cases';
import { CharacterSearchFilters } from '../../../domain/duelist/entities/character.entity';
import { sendSuccessResponse } from '../../shared/api-response.helper';

export interface CharacterControllerDependencies {
  getAllCharactersUseCase: GetAllCharactersUseCase;
  getCharacterByIdUseCase: GetCharacterByIdUseCase;
  getCharacterDecksUseCase: GetCharacterDecksUseCase;
}

export class CharacterController {
  private readonly getAllCharactersUseCase: GetAllCharactersUseCase;
  private readonly getCharacterByIdUseCase: GetCharacterByIdUseCase;
  private readonly getCharacterDecksUseCase: GetCharacterDecksUseCase;

  constructor(dependencies: CharacterControllerDependencies) {
    this.getAllCharactersUseCase = dependencies.getAllCharactersUseCase;
    this.getCharacterByIdUseCase = dependencies.getCharacterByIdUseCase;
    this.getCharacterDecksUseCase = dependencies.getCharacterDecksUseCase;
  }

  public async getAllCharacters(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const filters: CharacterSearchFilters = {
        name: request.query.name ? String(request.query.name) : undefined,
        tier: request.query.tier ? String(request.query.tier) : undefined,
        category: request.query.category ? String(request.query.category) : undefined
      };
      const characters = await this.getAllCharactersUseCase.execute(filters);
      sendSuccessResponse(response, characters);
    } catch (error) {
      next(error);
    }
  }

  public async getCharacterById(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const characterId = Number.parseInt(String(request.params.id), 10);
      const character = await this.getCharacterByIdUseCase.execute(characterId);
      sendSuccessResponse(response, character);
    } catch (error) {
      next(error);
    }
  }

  public async getCharacterDecks(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const characterId = Number.parseInt(String(request.params.id), 10);
      const limit = request.query.limit
        ? Number.parseInt(String(request.query.limit), 10)
        : undefined;
      const offset = request.query.offset
        ? Number.parseInt(String(request.query.offset), 10)
        : 0;
      const page = await this.getCharacterDecksUseCase.execute(characterId, limit, offset);
      sendSuccessResponse(response, page.decks, page.meta);
    } catch (error) {
      next(error);
    }
  }
}

