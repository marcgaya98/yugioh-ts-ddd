import { Card } from '../entities/card.entity';
import { CardSearchCriteria } from '../value-objects/card-search-criteria.value-object';

export interface CardQueryResult {
  cards: Card[];
  totalCount: number;
}

export interface CardRepository {
  searchWithCriteria(criteria: CardSearchCriteria): Promise<CardQueryResult>;
  findByIdWithDetails(id: number): Promise<Card | null>;
  findDistinctArchetypes(): Promise<string[]>;
  getMonsterTypeValues(): string[];
}

