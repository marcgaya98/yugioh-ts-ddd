import { EntityNotFoundError } from '../../../domain/shared/errors/domain.error';
import { CardDetailPresentation } from '../../../domain/catalog/entities/card.entity';
import { CardRepository } from '../../../domain/catalog/repositories/card.repository.interface';

export class GetCardByIdUseCase {
  constructor(private readonly cardRepository: CardRepository) {}

  public async execute(cardId: number, baseUrl = ''): Promise<CardDetailPresentation> {
    const card = await this.cardRepository.findByIdWithDetails(cardId);
    if (!card) {
      throw new EntityNotFoundError('Card');
    }
    return card.toDetailWithImages(baseUrl);
  }
}

