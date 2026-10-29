import { Request, Response, NextFunction } from 'express';
import {
  GameStatsUseCases,
  IconUseCases
} from '../../../application/game-stats/use-cases/game-stats.use-cases';
import { sendSuccessResponse } from '../../shared/api-response.helper';

export class GameStatsController {
  constructor(private readonly gameStatsUseCases: GameStatsUseCases) {}

  public async getAllBonuses(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const category = request.query.category
        ? String(request.query.category)
        : undefined;
      const bonuses = await this.gameStatsUseCases.getAllBonuses(category);
      sendSuccessResponse(response, bonuses);
    } catch (error) {
      next(error);
    }
  }

  public async getBonusById(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = Number.parseInt(String(request.params.id), 10);
      const bonus = await this.gameStatsUseCases.getBonusById(id);
      sendSuccessResponse(response, bonus);
    } catch (error) {
      next(error);
    }
  }

  public async getBonusesByCategory(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const category = String(request.params.category);
      const bonuses = await this.gameStatsUseCases.getAllBonuses(category);
      sendSuccessResponse(response, bonuses);
    } catch (error) {
      next(error);
    }
  }

  public async getAllChallenges(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const category = request.query.category
        ? String(request.query.category)
        : undefined;
      const difficulty = request.query.difficulty
        ? Number.parseInt(String(request.query.difficulty), 10)
        : undefined;
      const challenges = await this.gameStatsUseCases.getAllChallenges(
        category,
        difficulty
      );
      sendSuccessResponse(response, challenges);
    } catch (error) {
      next(error);
    }
  }

  public async getChallengeById(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = Number.parseInt(String(request.params.id), 10);
      const challenge = await this.gameStatsUseCases.getChallengeById(id);
      sendSuccessResponse(response, challenge);
    } catch (error) {
      next(error);
    }
  }

  public async getChallengesByCategory(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const category = String(request.params.category);
      const challenges = await this.gameStatsUseCases.getAllChallenges(category);
      sendSuccessResponse(response, challenges);
    } catch (error) {
      next(error);
    }
  }

  public async getAllHighScores(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const category = request.query.category
        ? String(request.query.category)
        : undefined;
      const highScores = await this.gameStatsUseCases.getAllHighScores(category);
      sendSuccessResponse(response, highScores);
    } catch (error) {
      next(error);
    }
  }

  public async getHighScoreById(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = Number.parseInt(String(request.params.id), 10);
      const highScore = await this.gameStatsUseCases.getHighScoreById(id);
      sendSuccessResponse(response, highScore);
    } catch (error) {
      next(error);
    }
  }

  public async getHighScoresByCategory(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const category = String(request.params.category);
      const highScores = await this.gameStatsUseCases.getAllHighScores(category);
      sendSuccessResponse(response, highScores);
    } catch (error) {
      next(error);
    }
  }
}

export class IconController {
  constructor(private readonly iconUseCases: IconUseCases) {}

  public async getAllIcons(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const category = request.query.category
        ? String(request.query.category)
        : undefined;
      const icons = await this.iconUseCases.getAllIcons(category);
      sendSuccessResponse(response, icons);
    } catch (error) {
      next(error);
    }
  }

  public async getIconsByCategory(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const category = String(request.params.category);
      const icons = await this.iconUseCases.getIconsByCategory(category);
      sendSuccessResponse(response, icons);
    } catch (error) {
      next(error);
    }
  }

  public async getIconByKey(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const category = String(request.params.category);
      const key = String(request.params.key);
      const icon = await this.iconUseCases.getIconByKey(category, key);
      sendSuccessResponse(response, icon);
    } catch (error) {
      next(error);
    }
  }
}

