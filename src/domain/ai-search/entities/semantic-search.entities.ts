export interface CardEmbeddingRecord {
  id: number;
  name: string;
  password: string | null;
  cardType: string;
  archetype: string | null;
  clipEmbedding: number[];
}

export interface VisualSimilarityMatch {
  cardId: string;
  similarity: number;
  name: string;
  password: string | null;
  cardType: string;
  archetype: string | null;
}

export interface SemanticSearchStats {
  totalCards: number;
  cardsWithPassword: number;
  cardsWithClipEmbedding: number;
  completionPercentage: number;
}

export interface BatchEmbeddingGenerationResult {
  processed: number;
  errors: number;
  total: number;
}

