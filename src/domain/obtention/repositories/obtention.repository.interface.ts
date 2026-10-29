import {
  CanonicalObtentionMethod,
  CardAllObtentionMethodsResult,
  CardWithObtentionEntry,
  InitialDeckObtentionResult,
  ObtentionMethodCount
} from '../entities/card-obtention.entity';

export interface ObtentionRepository {
  getAllMethodCounts(): Promise<ObtentionMethodCount[]>;
  getConverterCards(): Promise<CardWithObtentionEntry[]>;
  getPackCards(packId?: number): Promise<CardWithObtentionEntry[]>;
  getCharacterCards(characterId?: number): Promise<CardWithObtentionEntry[]>;
  getTutorialCards(day?: string): Promise<CardWithObtentionEntry[]>;
  getInitialDeckCards(): Promise<InitialDeckObtentionResult>;
  getSandwichCards(): Promise<CardWithObtentionEntry[]>;
  getCardIdsByAllMethods(): Promise<Map<CanonicalObtentionMethod, Set<number>>>;
  getCardsForExclusiveIds(
    method: CanonicalObtentionMethod,
    cardIds: number[]
  ): Promise<CardWithObtentionEntry[]>;
  getCardAllObtentionMethods(cardId: number): Promise<CardAllObtentionMethodsResult | null>;
}

