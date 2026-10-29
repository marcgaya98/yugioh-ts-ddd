import { PaginatedResult } from '../../../domain/shared/value-objects/pagination.value-object';
import { CardListItemPresentation, Card } from '../../../domain/catalog/entities/card.entity';
import {
  CardSearchCriteria,
  includesUnlimitedFilter
} from '../../../domain/catalog/value-objects/card-search-criteria.value-object';
import { CardRepository } from '../../../domain/catalog/repositories/card.repository.interface';
import { LimitListRepository } from '../../../domain/limit-list/repositories/limit-list.repository.interface';
import {
  CardLimitStatus,
  UNLIMITED_CARD_COPIES
} from '../../../domain/limit-list/value-objects/limit-status.value-object';

const MIXED_UNLIMITED_PAGINATION_WARNING =
  'Paginación aproximada debido a filtros combinados con unlimited';

export class SearchCardsUseCase {
  constructor(
    private readonly cardRepository: CardRepository,
    private readonly limitListRepository: LimitListRepository
  ) {}

  public async execute(
    criteria: CardSearchCriteria
  ): Promise<PaginatedResult<CardListItemPresentation>> {
    const effectiveCriteria = await this.enrichWithRestrictedCardIdsIfNeeded(criteria);
    const { cards, totalCount } = await this.cardRepository.searchWithCriteria(effectiveCriteria);
    const itemsWithLimits = await this.attachLimitStatuses(cards, criteria.limitList);

    return this.buildPaginatedResponse(itemsWithLimits, totalCount, criteria);
  }

  private async enrichWithRestrictedCardIdsIfNeeded(
    criteria: CardSearchCriteria
  ): Promise<CardSearchCriteria> {
    if (!criteria.limitFilter || includesUnlimitedFilter(criteria.limitFilter)) {
      return criteria;
    }

    const restrictedCardIds = await this.limitListRepository.findCardIdsByListAndLimits(
      criteria.limitList,
      criteria.limitFilter
    );

    return { ...criteria, restrictedCardIds };
  }

  private async attachLimitStatuses(
    cards: Card[],
    listName: string
  ): Promise<CardListItemPresentation[]> {
    const cardIds = cards.map(card => card.id);
    const statusMap = await this.limitListRepository.findStatusesForCardsInList(cardIds, listName);

    return cards.map(card => {
      const status = statusMap.get(card.id) ?? CardLimitStatus.createUnlimited(listName);
      return card.toListItem(status);
    });
  }

  private async buildPaginatedResponse(
    items: CardListItemPresentation[],
    initialCount: number,
    criteria: CardSearchCriteria
  ): Promise<PaginatedResult<CardListItemPresentation>> {
    if (!includesUnlimitedFilter(criteria.limitFilter)) {
      return {
        items,
        pagination: criteria.pagination.buildMetadata(initialCount)
      };
    }

    const allowedLimits = criteria.limitFilter ?? [];
    const filteredItems = items.filter(item => allowedLimits.includes(item.limitStatus.limit));
    const isOnlyUnlimited =
      allowedLimits.length === 1 && allowedLimits[0] === UNLIMITED_CARD_COPIES;

    if (isOnlyUnlimited) {
      const listedCount = await this.limitListRepository.countListedCardsInList(criteria.limitList);
      const adjustedTotal = Math.max(initialCount - listedCount, 0);
      return {
        items: filteredItems,
        pagination: criteria.pagination.buildMetadata(adjustedTotal)
      };
    }

    return {
      items: filteredItems,
      pagination: criteria.pagination.buildMetadata(
        initialCount,
        MIXED_UNLIMITED_PAGINATION_WARNING
      )
    };
  }
}

