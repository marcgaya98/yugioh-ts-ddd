import { Card } from '../../catalog/entities/card.entity';
import {
  CardEmbeddingRecord,
  SemanticSearchStats
} from '../entities/semantic-search.entities';

export interface CardEmbeddingRepository {
  getEmbeddingStats(): Promise<SemanticSearchStats>;
  findCardsWithClipEmbeddings(): Promise<CardEmbeddingRecord[]>;
  findCardEmbeddingById(cardId: number): Promise<CardEmbeddingRecord | null>;
  findCardsByIds(ids: number[]): Promise<Card[]>;
  findCardsWithoutClipEmbedding(): Promise<Array<{ id: number; name: string; password: string }>>;
  updateClipEmbedding(cardId: number, embedding: number[]): Promise<void>;
}

export interface ClipVisionPort {
  generateImageEmbedding(imagePath: string): Promise<number[] | null>;
}

