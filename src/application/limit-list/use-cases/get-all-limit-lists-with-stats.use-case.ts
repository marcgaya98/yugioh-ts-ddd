import { LimitListSummaryProps } from '../../../domain/limit-list/entities/limit-list-stats.entity';
import { LimitListRepository } from '../../../domain/limit-list/repositories/limit-list.repository.interface';

export interface AllLimitListsWithStatsResult {
  lists: LimitListSummaryProps[];
  count: number;
}

export class GetAllLimitListsWithStatsUseCase {
  constructor(private readonly limitListRepository: LimitListRepository) {}

  public async execute(): Promise<AllLimitListsWithStatsResult> {
    const summaries = await this.limitListRepository.findAllListsWithStats();
    const lists = summaries.map(summary => summary.toJSON());
    return {
      lists,
      count: lists.length
    };
  }
}

