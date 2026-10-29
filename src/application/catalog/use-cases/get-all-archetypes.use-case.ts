import { CardRepository } from '../../../domain/catalog/repositories/card.repository.interface';

export class GetAllArchetypesUseCase {
  constructor(private readonly cardRepository: CardRepository) {}

  public async execute(): Promise<string[]> {
    return this.cardRepository.findDistinctArchetypes();
  }
}

