import { BonusModel } from '../../models/bonus.model';
import { ChallengeModel } from '../../models/challenge.model';
import { HighScoreModel } from '../../models/high-score.model';
import { IconModel } from '../../models/icon.model';
import {
  BonusProps,
  ChallengeProps,
  HighScoreProps,
  IconProps
} from '../../../../domain/game-stats/entities/game-stats.entities';
import {
  GameStatsRepository,
  IconRepository
} from '../../../../domain/game-stats/repositories/game-stats.repository.interface';

export class SequelizeGameStatsRepository implements GameStatsRepository {
  public async findAllBonuses(category?: string): Promise<BonusProps[]> {
    const where = category ? { category } : {};
    const rows = await BonusModel.findAll({
      where,
      order: [['id', 'ASC']]
    });
    return rows.map(row => row.toJSON() as BonusProps);
  }

  public async findBonusById(id: number): Promise<BonusProps | null> {
    const row = await BonusModel.findByPk(id);
    return row ? (row.toJSON() as BonusProps) : null;
  }

  public async findAllChallenges(
    category?: string,
    difficulty?: number
  ): Promise<ChallengeProps[]> {
    const where: Record<string, unknown> = {};
    if (category) where.category = category;
    if (difficulty !== undefined) where.difficulty = difficulty;

    const rows = await ChallengeModel.findAll({
      where,
      order: [['id', 'ASC']]
    });
    return rows.map(row => row.toJSON() as ChallengeProps);
  }

  public async findChallengeById(id: number): Promise<ChallengeProps | null> {
    const row = await ChallengeModel.findByPk(id);
    return row ? (row.toJSON() as ChallengeProps) : null;
  }

  public async findAllHighScores(category?: string): Promise<HighScoreProps[]> {
    const where = category ? { category } : {};
    const rows = await HighScoreModel.findAll({
      where,
      order: [['id', 'ASC']]
    });
    return rows.map(row => row.toJSON() as HighScoreProps);
  }

  public async findHighScoreById(id: number): Promise<HighScoreProps | null> {
    const row = await HighScoreModel.findByPk(id);
    return row ? (row.toJSON() as HighScoreProps) : null;
  }
}

export class SequelizeIconRepository implements IconRepository {
  private isTableInitialized = false;

  private async ensureIconTableInitialized(): Promise<void> {
    if (this.isTableInitialized) {
      return;
    }
    await IconModel.sync();
    this.isTableInitialized = true;
  }

  public async findAll(category?: string): Promise<IconProps[]> {
    await this.ensureIconTableInitialized();
    const where = category ? { category } : {};
    const rows = await IconModel.findAll({
      where,
      order: [
        ['category', 'ASC'],
        ['key', 'ASC']
      ]
    });
    return rows.map(row => row.toJSON() as IconProps);
  }

  public async findByCategory(category: string): Promise<IconProps[]> {
    await this.ensureIconTableInitialized();
    const rows = await IconModel.findAll({
      where: { category },
      order: [['key', 'ASC']]
    });
    return rows.map(row => row.toJSON() as IconProps);
  }

  public async findByCategoryAndKey(
    category: string,
    key: string
  ): Promise<IconProps | null> {
    await this.ensureIconTableInitialized();
    const row = await IconModel.findOne({
      where: { category, key }
    });
    return row ? (row.toJSON() as IconProps) : null;
  }
}

