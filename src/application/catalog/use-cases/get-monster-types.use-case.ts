import { CardRepository } from '../../../domain/catalog/repositories/card.repository.interface';

export class GetMonsterTypesUseCase {
  constructor(private readonly cardRepository: CardRepository) {}

  public execute(): string[] {
    return this.cardRepository.getMonsterTypeValues();
  }
}

