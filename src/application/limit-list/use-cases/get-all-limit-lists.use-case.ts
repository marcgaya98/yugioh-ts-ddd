import { LimitListRepository } from '../../../domain/limit-list/repositories/limit-list.repository.interface';

export interface AllLimitListsResult {
  lists: string[];
  count: number;
}

export class GetAllLimitListsUseCase {
  constructor(private readonly limitListRepository: LimitListRepository) {}

  public async execute(): Promise<AllLimitListsResult> {
    const lists = await this.limitListRepository.findAllListNames();
    return {
      lists,
      count: lists.length
    };
  }
}

