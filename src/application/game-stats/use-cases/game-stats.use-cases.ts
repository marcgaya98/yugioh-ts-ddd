import { EntityNotFoundError } from '../../../domain/shared/errors/domain.error';
import {
  BonusProps,
  ChallengeProps,
  HighScoreProps,
  IconProps
} from '../../../domain/game-stats/entities/game-stats.entities';
import {
  GameStatsRepository,
  IconRepository
} from '../../../domain/game-stats/repositories/game-stats.repository.interface';

export class GameStatsUseCases {
  constructor(private readonly gameStatsRepository: GameStatsRepository) {}

  public async getAllBonuses(category?: string): Promise<BonusProps[]> {
    return this.gameStatsRepository.findAllBonuses(category);
  }

  public async getBonusById(id: number): Promise<BonusProps> {
    const bonus = await this.gameStatsRepository.findBonusById(id);
    if (!bonus) {
      throw new EntityNotFoundError('Bonificación');
    }
    return bonus;
  }

  public async getAllChallenges(
    category?: string,
    difficulty?: number
  ): Promise<ChallengeProps[]> {
    return this.gameStatsRepository.findAllChallenges(category, difficulty);
  }

  public async getChallengeById(id: number): Promise<ChallengeProps> {
    const challenge = await this.gameStatsRepository.findChallengeById(id);
    if (!challenge) {
      throw new EntityNotFoundError('Desafío');
    }
    return challenge;
  }

  public async getAllHighScores(category?: string): Promise<HighScoreProps[]> {
    return this.gameStatsRepository.findAllHighScores(category);
  }

  public async getHighScoreById(id: number): Promise<HighScoreProps> {
    const highScore = await this.gameStatsRepository.findHighScoreById(id);
    if (!highScore) {
      throw new EntityNotFoundError('High score');
    }
    return highScore;
  }
}

export class IconUseCases {
  constructor(private readonly iconRepository: IconRepository) {}

  public async getAllIcons(category?: string): Promise<IconProps[]> {
    return this.iconRepository.findAll(category);
  }

  public async getIconsByCategory(category: string): Promise<IconProps[]> {
    return this.iconRepository.findByCategory(category);
  }

  public async getIconByKey(category: string, key: string): Promise<IconProps> {
    const icon = await this.iconRepository.findByCategoryAndKey(category, key);
    if (!icon) {
      throw new EntityNotFoundError('Icono');
    }
    return icon;
  }
}

