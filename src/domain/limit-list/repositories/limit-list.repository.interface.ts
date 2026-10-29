import { LimitListSummary } from '../entities/limit-list-stats.entity';
import { CardLimitStatus } from '../value-objects/limit-status.value-object';

export interface LimitListRepository {
  findAllListNames(): Promise<string[]>;
  findStatsByListName(listName: string): Promise<LimitListSummary | null>;
  findAllListsWithStats(): Promise<LimitListSummary[]>;
  findCardIdsByListAndLimits(listName: string, allowedLimits: number[]): Promise<number[]>;
  findStatusesForCardsInList(cardIds: number[], listName: string): Promise<Map<number, CardLimitStatus>>;
  countListedCardsInList(listName: string): Promise<number>;
}

