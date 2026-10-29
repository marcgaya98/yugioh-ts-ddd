import { Op } from 'sequelize';
import { sequelize } from '../../../config/database.config';
import { CardLimitListModel } from '../../models/card-limit-list.model';
import { LimitListRepository } from '../../../../domain/limit-list/repositories/limit-list.repository.interface';
import { LimitListSummary, LimitStatusCount } from '../../../../domain/limit-list/entities/limit-list-stats.entity';
import { CardLimitStatus, LimitRestrictionStatus } from '../../../../domain/limit-list/value-objects/limit-status.value-object';

const STATUS_SORT_SQL_EXPRESSION = `CASE status 
  WHEN 'forbidden' THEN 1 
  WHEN 'limited' THEN 2 
  WHEN 'semi-limited' THEN 3 
  WHEN 'unlimited' THEN 4 
END`;

export class SequelizeLimitListRepository implements LimitListRepository {
  public async findAllListNames(): Promise<string[]> {
    const rows = await CardLimitListModel.findAll({
      attributes: ['listName'],
      group: ['listName'],
      order: [['listName', 'ASC']]
    });

    return rows.map(row => row.listName);
  }

  public async findStatsByListName(listName: string): Promise<LimitListSummary | null> {
    const rows = await CardLimitListModel.findAll({
      where: { listName },
      attributes: ['status', [sequelize.fn('COUNT', '*'), 'count']],
      group: ['status'],
      order: [[sequelize.literal(STATUS_SORT_SQL_EXPRESSION), 'ASC']]
    });

    if (rows.length === 0) {
      return null;
    }

    const stats: LimitStatusCount[] = rows.map(row => ({
      status: row.status as LimitRestrictionStatus,
      count: Number(row.getDataValue('count'))
    }));

    return new LimitListSummary(listName, stats);
  }

  public async findAllListsWithStats(): Promise<LimitListSummary[]> {
    const rows = await CardLimitListModel.findAll({
      attributes: ['listName', 'status', [sequelize.fn('COUNT', '*'), 'count']],
      group: ['listName', 'status'],
      order: [
        ['listName', 'ASC'],
        [sequelize.literal(STATUS_SORT_SQL_EXPRESSION), 'ASC']
      ]
    });

    const groupedByList = this.groupStatusRowsByListName(rows);
    return Array.from(groupedByList.entries()).map(
      ([listName, stats]) => new LimitListSummary(listName, stats)
    );
  }

  public async findCardIdsByListAndLimits(
    listName: string,
    allowedLimits: number[]
  ): Promise<number[]> {
    const rows = await CardLimitListModel.findAll({
      where: {
        listName,
        limit: { [Op.in]: allowedLimits }
      },
      attributes: ['cardId']
    });

    return rows.map(row => row.cardId);
  }

  public async findStatusesForCardsInList(
    cardIds: number[],
    listName: string
  ): Promise<Map<number, CardLimitStatus>> {
    const statusMap = new Map<number, CardLimitStatus>();
    if (cardIds.length === 0) {
      return statusMap;
    }

    const rows = await CardLimitListModel.findAll({
      where: {
        cardId: { [Op.in]: cardIds },
        listName
      }
    });

    for (const row of rows) {
      statusMap.set(
        row.cardId,
        new CardLimitStatus({
          listName: row.listName,
          status: row.status,
          limit: row.limit
        })
      );
    }

    return statusMap;
  }

  public async countListedCardsInList(listName: string): Promise<number> {
    return CardLimitListModel.count({
      where: { listName },
      distinct: true,
      col: 'cardId'
    });
  }

  private groupStatusRowsByListName(rows: CardLimitListModel[]): Map<string, LimitStatusCount[]> {
    const grouped = new Map<string, LimitStatusCount[]>();

    for (const row of rows) {
      const currentList = grouped.get(row.listName) ?? [];
      currentList.push({
        status: row.status as LimitRestrictionStatus,
        count: Number(row.getDataValue('count'))
      });
      grouped.set(row.listName, currentList);
    }

    return grouped;
  }
}

