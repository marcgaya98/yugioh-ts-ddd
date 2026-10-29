import { EntityNotFoundError } from '../../../domain/shared/errors/domain.error';
import { DeckProps, DeckSearchFilters } from '../../../domain/duelist/entities/deck.entity';
import { DeckRepository } from '../../../domain/duelist/repositories/deck.repository.interface';

export class GetAllDecksUseCase {
  constructor(private readonly deckRepository: DeckRepository) {}

  public async execute(filters: DeckSearchFilters): Promise<DeckProps[]> {
    const decks = await this.deckRepository.findAll(filters);
    return decks.map(deck => deck.toJSON());
  }
}

export class GetDeckByIdUseCase {
  constructor(private readonly deckRepository: DeckRepository) {}

  public async execute(deckId: string): Promise<Record<string, unknown>> {
    const deck = await this.deckRepository.findByIdWithDetails(deckId);
    if (!deck) {
      throw new EntityNotFoundError('Deck');
    }
    return deck;
  }
}

export class GetDeckCardsUseCase {
  constructor(private readonly deckRepository: DeckRepository) {}

  public async execute(deckId: string): Promise<Record<string, unknown>[]> {
    const cards = await this.deckRepository.findCardsByDeckId(deckId);
    if (!cards) {
      throw new EntityNotFoundError('Deck');
    }
    return cards;
  }
}

