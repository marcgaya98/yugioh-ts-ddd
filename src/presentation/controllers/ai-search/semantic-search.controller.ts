import { Request, Response, NextFunction } from 'express';
import {
  FindSimilarCardsByClipUseCase,
  GetSemanticSearchStatsUseCase,
  RunSemanticSearchTestSuiteUseCase,
  SearchByVisualDescriptionUseCase,
  SearchByVisualStyleUseCase,
  StartClipEmbeddingsGenerationUseCase
} from '../../../application/ai-search/use-cases/semantic-search.use-cases';
import { sendSuccessResponse } from '../../shared/api-response.helper';

const DEFAULT_LIMIT = 20;
const DEFAULT_SIMILAR_LIMIT = 12;
const DEFAULT_BATCH_SIZE = 10;

export interface SemanticSearchControllerDependencies {
  searchByVisualDescriptionUseCase: SearchByVisualDescriptionUseCase;
  searchByVisualStyleUseCase: SearchByVisualStyleUseCase;
  findSimilarCardsByClipUseCase: FindSimilarCardsByClipUseCase;
  getSemanticSearchStatsUseCase: GetSemanticSearchStatsUseCase;
  runSemanticSearchTestSuiteUseCase: RunSemanticSearchTestSuiteUseCase;
  startClipEmbeddingsGenerationUseCase: StartClipEmbeddingsGenerationUseCase;
}

export class SemanticSearchController {
  constructor(private readonly deps: SemanticSearchControllerDependencies) {}

  public async searchByVisualDescription(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const query = request.query.query ? String(request.query.query) : undefined;
      const limit = this.parsePositiveLimit(request.query.limit, DEFAULT_LIMIT);
      const baseUrl = this.resolveBaseUrl(request);

      const { results, meta } = await this.deps.searchByVisualDescriptionUseCase.execute(
        query,
        limit,
        baseUrl
      );
      sendSuccessResponse(response, results, meta);
    } catch (error) {
      next(error);
    }
  }

  public async searchByStyle(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const style = request.query.style ? String(request.query.style) : undefined;
      const limit = this.parsePositiveLimit(request.query.limit, DEFAULT_LIMIT);
      const result = await this.deps.searchByVisualStyleUseCase.execute(style, limit);
      sendSuccessResponse(response, result);
    } catch (error) {
      next(error);
    }
  }

  public async findSimilarCards(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { cardId } = request.params;
      const limit = this.parsePositiveLimit(request.query.limit, DEFAULT_SIMILAR_LIMIT);
      const result = await this.deps.findSimilarCardsByClipUseCase.execute(cardId, limit);
      sendSuccessResponse(response, result);
    } catch (error) {
      next(error);
    }
  }

  public async getSemanticSearchStats(
    _request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const stats = await this.deps.getSemanticSearchStatsUseCase.execute();
      sendSuccessResponse(response, stats);
    } catch (error) {
      next(error);
    }
  }

  public async generateClipEmbeddings(
    request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const batchSize = this.parsePositiveLimit(request.query.batchSize, DEFAULT_BATCH_SIZE);
      const result = await this.deps.startClipEmbeddingsGenerationUseCase.execute(batchSize);
      sendSuccessResponse(response, result);
    } catch (error) {
      next(error);
    }
  }

  public async testSemanticSearch(
    _request: Request,
    response: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await this.deps.runSemanticSearchTestSuiteUseCase.execute();
      sendSuccessResponse(response, result);
    } catch (error) {
      next(error);
    }
  }

  private parsePositiveLimit(rawLimit: unknown, fallback: number): number {
    if (!rawLimit) {
      return fallback;
    }
    const parsed = Number.parseInt(String(rawLimit), 10);
    return Number.isNaN(parsed) || parsed <= 0 ? fallback : parsed;
  }

  private resolveBaseUrl(request: Request): string {
    const host = request.get ? request.get('host') : 'localhost:3001';
    const protocol = request.protocol || 'http';
    return `${protocol}://${host}`;
  }
}
