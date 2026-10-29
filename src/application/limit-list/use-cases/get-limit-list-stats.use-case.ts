import { EntityNotFoundError } from '../../../domain/shared/errors/domain.error';
import { LimitListSummaryProps } from '../../../domain/limit-list/entities/limit-list-stats.entity';
import { LimitListRepository } from '../../../domain/limit-list/repositories/limit-list.repository.interface';

export class GetLimitListStatsUseCase {
  constructor(private readonly limitListRepository: LimitListRepository) {}

  public async execute(listName: string): Promise<LimitListSummaryProps> {
    const summary = await this.limitListRepository.findStatsByListName(listName);
    if (!summary || summary.isEmpty()) {
      throw new EntityNotFoundError('Limit list', listName);
    }
    return summary.toJSON();
  }
}

