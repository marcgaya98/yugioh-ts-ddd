import { Deck, DeckSearchFilters } from '../entities/deck.entity';

export interface DeckRepository {
  findAll(filters: DeckSearchFilters): Promise<Deck[]>;
  findByIdWithDetails(id: string): Promise<Record<string, unknown> | null>;
  findCardsByDeckId(id: string): Promise<Record<string, unknown>[] | null>;
}

