import { CardPassword } from '../../src/domain/shared/value-objects/card-password.value-object';
import { PaginationCriteria } from '../../src/domain/shared/value-objects/pagination.value-object';
import { DomainValidationError } from '../../src/domain/shared/errors/domain.error';
import { Card } from '../../src/domain/catalog/entities/card.entity';
import { Genre } from '../../src/domain/catalog/entities/genre.entity';
import {
  buildCardSearchCriteriaFromQuery,
  includesUnlimitedFilter
} from '../../src/domain/catalog/value-objects/card-search-criteria.value-object';
import { CardLimitStatus } from '../../src/domain/limit-list/value-objects/limit-status.value-object';
import { LimitListSummary } from '../../src/domain/limit-list/entities/limit-list-stats.entity';
import {
  computeExclusiveCardIds,
  resolveCanonicalObtentionMethod,
  CanonicalObtentionMethod
} from '../../src/domain/obtention/entities/card-obtention.entity';

describe('Domain Value Objects & Entities', () => {
  describe('CardPassword Value Object', () => {
    it('validates and creates an 8-digit password', () => {
      const password = CardPassword.create('06368038');
      expect(password.getValue()).toBe('06368038');
      expect(password.getNormalizedForUrl()).toBe('6368038');
      expect(password.buildListImageUrl()).toBe('/images/cards/normal/06368038.jpg');
    });

    it('builds image variants with normalized password', () => {
      const password = CardPassword.create('00000123');
      const variants = password.buildImageVariants('http://localhost:3000');
      expect(variants).toEqual({
        normal: 'http://localhost:3000/images/cards/normal/123.jpg',
        small: 'http://localhost:3000/images/cards/small/123.jpg',
        cropped: 'http://localhost:3000/images/cards/cropped/123.jpg'
      });
    });

    it('throws DomainValidationError on invalid password format', () => {
      expect(() => CardPassword.create('123')).toThrow(DomainValidationError);
      expect(() => CardPassword.create('abcdefgh')).toThrow(DomainValidationError);
    });

    it('creates optional password padding leading zeros when needed', () => {
      const padded = CardPassword.createOptional('6368038');
      expect(padded?.getValue()).toBe('06368038');
      expect(CardPassword.createOptional(null)).toBeNull();
      expect(CardPassword.createOptional('')).toBeNull();
    });
  });

  describe('PaginationCriteria Value Object', () => {
    it('uses defaults (page 1, pageSize 24, offset 0)', () => {
      const criteria = PaginationCriteria.create();
      expect(criteria.page).toBe(1);
      expect(criteria.pageSize).toBe(24);
      expect(criteria.offset).toBe(0);
    });

    it('clamps pageSize between 1 and 100 and calculates offset from page', () => {
      const criteria = PaginationCriteria.create({ page: '3', pageSize: '250' });
      expect(criteria.page).toBe(3);
      expect(criteria.pageSize).toBe(100);
      expect(criteria.offset).toBe(200);
    });

    it('builds accurate pagination metadata with hasNext and hasPrev', () => {
      const criteria = PaginationCriteria.create({ page: 2, pageSize: 10 });
      const meta = criteria.buildMetadata(25, 'Approximation warning');
      expect(meta).toEqual({
        total: 25,
        page: 2,
        pageSize: 10,
        totalPages: 3,
        hasNext: true,
        hasPrev: true,
        warning: 'Approximation warning'
      });
    });
  });

  describe('CardSearchCriteria Builder', () => {
    it('parses multi-value, boolean, range, and limit parameters from query', () => {
      const criteria = buildCardSearchCriteriaFromQuery({
        name: 'Blue-Eyes',
        rarity: 'ultra,super',
        cardType: 'Monster',
        attribute: 'LIGHT,DARK',
        effectTrait: 'true',
        levelMin: '7',
        levelMax: '8',
        attackMin: '2500',
        genres: '1,2',
        sortBy: 'attack',
        sortOrder: 'desc',
        limitList: 'March 2007',
        limitFilter: '0,3',
        page: '1',
        pageSize: '10'
      });

      expect(criteria.name).toBe('Blue-Eyes');
      expect(criteria.rarity).toEqual(['ultra', 'super']);
      expect(criteria.cardType).toEqual(['Monster']);
      expect(criteria.monsterFilters.attribute).toEqual(['LIGHT', 'DARK']);
      expect(criteria.monsterFilters.effectTrait).toBe(true);
      expect(criteria.monsterFilters.level).toEqual({
        exact: undefined,
        min: 7,
        max: 8
      });
      expect(criteria.monsterFilters.attack).toEqual({
        exact: undefined,
        min: 2500,
        max: undefined
      });
      expect(criteria.genres).toEqual([1, 2]);
      expect(criteria.sortBy).toBe('attack');
      expect(criteria.sortOrder).toBe('DESC');
      expect(criteria.limitList).toBe('March 2007');
      expect(criteria.limitFilter).toEqual([0, 3]);
      expect(includesUnlimitedFilter(criteria.limitFilter)).toBe(true);
    });
  });

  describe('Card Entity & LimitListSummary Entity', () => {
    const sampleCard = new Card({
      id: 1,
      name: 'Blue-Eyes White Dragon',
      code: 'LOB-001',
      description: 'This legendary dragon is a powerful engine of destruction.',
      imageUrl: 'https://images.ygoprodeck.com/images/cards/89631139.jpg',
      password: '89631139',
      rarity: 'ultra',
      frame: 'normal',
      archetype: 'Blue-Eyes',
      cardType: 'Monster',
      alterName: null,
      genres: [new Genre({ id: 1, name: 'Normal Monster', category: 'Monster categories' })],
      monsterData: {
        cardId: 1,
        attribute: 'LIGHT',
        effectTrait: false,
        summonMechanic: null,
        ability: null,
        type: 'Dragon',
        level: 8,
        attack: 3000,
        defense: 2500
      }
    });

    it('serializes Card to list item with limitStatus and local image_url', () => {
      const limitStatus = CardLimitStatus.createUnlimited('Game Original');
      const listItem = sampleCard.toListItem(limitStatus);

      expect(listItem.id).toBe(1);
      expect(listItem.image_url).toBe('/images/cards/normal/89631139.jpg');
      expect(listItem.limitStatus).toEqual({
        listName: 'Game Original',
        status: 'unlimited',
        limit: 3
      });
      expect(listItem.genres).toHaveLength(1);
    });

    it('serializes Card to detail presentation with image variants', () => {
      const detail = sampleCard.toDetailWithImages('http://localhost:3000');
      expect(detail.images).toEqual({
        normal: 'http://localhost:3000/images/cards/normal/89631139.jpg',
        small: 'http://localhost:3000/images/cards/small/89631139.jpg',
        cropped: 'http://localhost:3000/images/cards/cropped/89631139.jpg'
      });
    });

    it('calculates totalCards in LimitListSummary', () => {
      const summary = new LimitListSummary('Game Original', [
        { status: 'forbidden', count: 28 },
        { status: 'limited', count: 53 },
        { status: 'semi-limited', count: 12 }
      ]);
      expect(summary.totalCards).toBe(93);
      expect(summary.isEmpty()).toBe(false);
    });
  });

  describe('Obtention Domain Logic', () => {
    it('resolves legacy method aliases to canonical methods', () => {
      expect(resolveCanonicalObtentionMethod('character')).toBe('victory');
      expect(resolveCanonicalObtentionMethod('victory')).toBe('victory');
      expect(resolveCanonicalObtentionMethod('initial_deck')).toBe('initial');
      expect(resolveCanonicalObtentionMethod('invalid')).toBeNull();
    });

    it('computes exclusive card IDs present only in the target method', () => {
      const map = new Map<CanonicalObtentionMethod, Set<number>>([
        ['pack', new Set([1, 2, 3])],
        ['victory', new Set([2, 4])],
        ['converter', new Set([3, 5])],
        ['tutorial', new Set([])],
        ['initial', new Set([])],
        ['sandwich', new Set([6])]
      ]);

      expect(computeExclusiveCardIds('pack', map)).toEqual([1]);
      expect(computeExclusiveCardIds('victory', map)).toEqual([4]);
      expect(computeExclusiveCardIds('sandwich', map)).toEqual([6]);
    });
  });
});

