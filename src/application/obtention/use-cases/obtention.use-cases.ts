import {
  EntityNotFoundError,
  InvalidParameterError
} from '../../../domain/shared/errors/domain.error';
import {
  CanonicalObtentionMethod,
  CardAllObtentionMethodsResult,
  CardWithObtentionEntry,
  computeExclusiveCardIds,
  ExclusiveCardsResult,
  InitialDeckObtentionResult,
  ObtentionMethodCount,
  resolveCanonicalObtentionMethod,
  VALID_EXCLUSIVE_METHODS
} from '../../../domain/obtention/entities/card-obtention.entity';
import { ObtentionRepository } from '../../../domain/obtention/repositories/obtention.repository.interface';

export class ObtentionUseCases {
  private readonly methodDispatchMap: Record<
    CanonicalObtentionMethod,
    () => Promise<CardWithObtentionEntry[] | InitialDeckObtentionResult>
  >;

  constructor(private readonly obtentionRepository: ObtentionRepository) {
    this.methodDispatchMap = {
      pack: () => this.obtentionRepository.getPackCards(),
      victory: () => this.obtentionRepository.getCharacterCards(),
      converter: () => this.obtentionRepository.getConverterCards(),
      tutorial: () => this.obtentionRepository.getTutorialCards(),
      initial: () => this.obtentionRepository.getInitialDeckCards(),
      sandwich: () => this.obtentionRepository.getSandwichCards()
    };
  }

  public async getAllMethodsSummary(): Promise<ObtentionMethodCount[]> {
    return this.obtentionRepository.getAllMethodCounts();
  }

  public async getCardsByLegacyMethod(
    rawMethod: string
  ): Promise<CardWithObtentionEntry[] | InitialDeckObtentionResult> {
    const canonical = resolveCanonicalObtentionMethod(rawMethod);
    if (!canonical) {
      throw new InvalidParameterError(
        `Método no válido: ${rawMethod}. Métodos válidos: pack, character, converter, tutorial, initial, sandwich`
      );
    }
    return this.methodDispatchMap[canonical]();
  }

  public async getExclusiveCards(rawMethod: string): Promise<ExclusiveCardsResult> {
    const isValidMethod = (VALID_EXCLUSIVE_METHODS as readonly string[]).includes(rawMethod);
    if (!isValidMethod) {
      throw new InvalidParameterError('Método no válido');
    }

    const targetMethod = rawMethod as CanonicalObtentionMethod;
    const cardIdsByMethod = await this.obtentionRepository.getCardIdsByAllMethods();
    const exclusiveIds = computeExclusiveCardIds(targetMethod, cardIdsByMethod);

    if (exclusiveIds.length === 0) {
      return {
        cards: [],
        meta: { method: targetMethod, exclusiveCount: 0 }
      };
    }

    const cards = await this.obtentionRepository.getCardsForExclusiveIds(targetMethod, exclusiveIds);
    return {
      cards,
      meta: { method: targetMethod, exclusiveCount: cards.length }
    };
  }

  public async getConverterCards(): Promise<CardWithObtentionEntry[]> {
    return this.obtentionRepository.getConverterCards();
  }

  public async getPackCards(packId?: number): Promise<CardWithObtentionEntry[]> {
    return this.obtentionRepository.getPackCards(packId);
  }

  public async getCharacterCards(characterId?: number): Promise<CardWithObtentionEntry[]> {
    return this.obtentionRepository.getCharacterCards(characterId);
  }

  public async getTutorialCards(day?: string): Promise<CardWithObtentionEntry[]> {
    return this.obtentionRepository.getTutorialCards(day);
  }

  public async getInitialDeckCards(): Promise<InitialDeckObtentionResult> {
    return this.obtentionRepository.getInitialDeckCards();
  }

  public async getSandwichCards(): Promise<CardWithObtentionEntry[]> {
    return this.obtentionRepository.getSandwichCards();
  }

  public async getCardAllObtentionMethods(cardId: number): Promise<CardAllObtentionMethodsResult> {
    const result = await this.obtentionRepository.getCardAllObtentionMethods(cardId);
    if (!result) {
      throw new EntityNotFoundError('Carta');
    }
    return result;
  }
}

