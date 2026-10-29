import { LimitRestrictionStatus } from '../value-objects/limit-status.value-object';

export interface LimitStatusCount {
  status: LimitRestrictionStatus;
  count: number;
}

export interface LimitListSummaryProps {
  listName: string;
  stats: LimitStatusCount[];
  totalCards: number;
}

export class LimitListSummary {
  public readonly listName: string;
  public readonly stats: LimitStatusCount[];
  public readonly totalCards: number;

  constructor(listName: string, stats: LimitStatusCount[]) {
    this.listName = listName;
    this.stats = stats;
    this.totalCards = stats.reduce((sum, item) => sum + item.count, 0);
  }

  public isEmpty(): boolean {
    return this.stats.length === 0;
  }

  public toJSON(): LimitListSummaryProps {
    return {
      listName: this.listName,
      stats: this.stats,
      totalCards: this.totalCards
    };
  }
}

