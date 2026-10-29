import {
  SPANISH_TO_ENGLISH_VISUAL_TERMS,
  VISUAL_CONCEPTS,
  VISUAL_QUERY_STOP_WORDS
} from '../value-objects/visual-concepts.catalog';

const PARTIAL_WORD_MATCH_WEIGHT = 0.7;
const MAX_SIMILARITY_SCORE = 1.0;
const MIN_SUBSTRING_TOKEN_LENGTH = 4;

export class VisualSimilarityCalculator {
  public static parseEmbeddingVector(rawEmbedding: unknown): number[] | null {
    if (Array.isArray(rawEmbedding)) {
      return rawEmbedding.every(item => typeof item === 'number') ? rawEmbedding : null;
    }

    if (typeof rawEmbedding === 'string') {
      const trimmed = rawEmbedding.trim();
      if (!trimmed.startsWith('[') || !trimmed.endsWith(']')) {
        return null;
      }
      try {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed) ? parsed : null;
      } catch {
        return null;
      }
    }

    return null;
  }

  public static translateQueryToEnglish(searchText: string): string {
    const cleanTokens = searchText
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter(token => token.length > 0 && !VISUAL_QUERY_STOP_WORDS.has(token));

    return cleanTokens
      .map(token => SPANISH_TO_ENGLISH_VISUAL_TERMS[token] ?? token)
      .join(' ');
  }

  public static buildConceptQueryVector(searchText: string): number[] {
    const translatedText = this.translateQueryToEnglish(searchText);
    const searchWords = translatedText.split(/\s+/).filter(Boolean);

    return VISUAL_CONCEPTS.map(concept =>
      this.scoreSingleConcept(concept.toLowerCase(), translatedText, searchWords)
    );
  }

  public static calculateFeatureSimilarity(
    searchText: string,
    imageFeatures: number[]
  ): number {
    if (!this.isValidConceptVector(imageFeatures)) {
      return 0;
    }

    const textScores = this.buildConceptQueryVector(searchText);
    const activeConceptsCount = textScores.filter(score => score > 0).length;
    if (activeConceptsCount === 0) {
      return 0;
    }

    const dotProduct = this.computeDotProduct(textScores, imageFeatures);
    const normalizedScore = dotProduct / activeConceptsCount;

    if (Number.isNaN(normalizedScore) || normalizedScore < 0) {
      return 0;
    }

    return Math.min(normalizedScore, MAX_SIMILARITY_SCORE);
  }

  public static calculateCosineSimilarity(vectorA: number[], vectorB: number[]): number {
    if (vectorA.length === 0 || vectorA.length !== vectorB.length) {
      return 0;
    }

    const dotProduct = this.computeDotProduct(vectorA, vectorB);
    const normA = Math.sqrt(this.computeDotProduct(vectorA, vectorA));
    const normB = Math.sqrt(this.computeDotProduct(vectorB, vectorB));

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (normA * normB);
  }

  private static isValidConceptVector(imageFeatures: number[]): boolean {
    return Array.isArray(imageFeatures) && imageFeatures.length === VISUAL_CONCEPTS.length;
  }

  private static scoreSingleConcept(
    conceptLower: string,
    translatedText: string,
    searchWords: string[]
  ): number {
    if (translatedText.includes(conceptLower)) {
      return MAX_SIMILARITY_SCORE;
    }

    const conceptWords = conceptLower.split(/\s+/);
    const matchingWords = conceptWords.filter(conceptWord =>
      searchWords.some(
        searchWord =>
          searchWord === conceptWord ||
          (searchWord.length >= MIN_SUBSTRING_TOKEN_LENGTH &&
            conceptWord.length >= MIN_SUBSTRING_TOKEN_LENGTH &&
            (searchWord.includes(conceptWord) || conceptWord.includes(searchWord)))
      )
    );

    if (matchingWords.length === 0) {
      return 0;
    }

    return (matchingWords.length / conceptWords.length) * PARTIAL_WORD_MATCH_WEIGHT;
  }

  private static computeDotProduct(vectorA: number[], vectorB: number[]): number {
    let sum = 0;
    for (let index = 0; index < vectorA.length; index++) {
      sum += vectorA[index] * vectorB[index];
    }
    return sum;
  }
}

