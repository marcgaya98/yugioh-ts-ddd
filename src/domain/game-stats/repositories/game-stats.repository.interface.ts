import {
  BonusProps,
  ChallengeProps,
  HighScoreProps,
  IconProps
} from '../entities/game-stats.entities';

export interface GameStatsRepository {
  findAllBonuses(category?: string): Promise<BonusProps[]>;
  findBonusById(id: number): Promise<BonusProps | null>;
  findAllChallenges(category?: string, difficulty?: number): Promise<ChallengeProps[]>;
  findChallengeById(id: number): Promise<ChallengeProps | null>;
  findAllHighScores(category?: string): Promise<HighScoreProps[]>;
  findHighScoreById(id: number): Promise<HighScoreProps | null>;
}

export interface IconRepository {
  findAll(category?: string): Promise<IconProps[]>;
  findByCategory(category: string): Promise<IconProps[]>;
  findByCategoryAndKey(category: string, key: string): Promise<IconProps | null>;
}

