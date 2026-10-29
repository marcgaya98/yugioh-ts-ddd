import { PaginationCriteria } from '../../shared/value-objects/pagination.value-object';
import { DEFAULT_LIMIT_LIST_NAME, UNLIMITED_CARD_COPIES } from '../../limit-list/value-objects/limit-status.value-object';

export interface NumericRangeFilter {
  exact?: number[];
  min?: number;
  max?: number;
}

export interface MonsterFilterCriteria {
  attribute?: string[];
  effectTrait?: boolean;
  summonMechanic?: string;
  ability?: string[];
  type?: string[];
  level?: NumericRangeFilter;
  attack?: NumericRangeFilter;
  defense?: NumericRangeFilter;
}

export interface CardSearchCriteria {
  name?: string;
  code?: string;
  rarity?: string[];
  frame?: string[];
  archetype?: string[];
  cardType?: string[];
  alterName?: string;
  password?: string;
  genres?: number[];
  monsterFilters: MonsterFilterCriteria;
  spellType?: string[];
  trapType?: string[];
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
  limitList: string;
  limitFilter?: number[];
  restrictedCardIds?: number[];
  pagination: PaginationCriteria;
}

export function parseMultiStringParam(rawParam: unknown): string[] | undefined {
  if (rawParam === undefined || rawParam === null || rawParam === '') {
    return undefined;
  }

  if (Array.isArray(rawParam)) {
    const cleaned = rawParam.map(item => String(item).trim()).filter(Boolean);
    return cleaned.length > 0 ? cleaned : undefined;
  }

  const values = String(rawParam)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);

  return values.length > 0 ? values : undefined;
}

export function parseMultiNumberParam(rawParam: unknown): number[] | undefined {
  const stringValues = parseMultiStringParam(rawParam);
  if (!stringValues) {
    return undefined;
  }

  const numbers = stringValues
    .map(val => Number.parseInt(val, 10))
    .filter(num => !Number.isNaN(num));

  return numbers.length > 0 ? numbers : undefined;
}

export function parseOptionalInt(rawParam: unknown): number | undefined {
  if (rawParam === undefined || rawParam === null || rawParam === '') {
    return undefined;
  }
  const parsed = Number.parseInt(String(rawParam), 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export function parseOptionalBoolean(rawParam: unknown): boolean | undefined {
  if (rawParam === undefined || rawParam === null || rawParam === '') {
    return undefined;
  }
  if (typeof rawParam === 'boolean') {
    return rawParam;
  }
  const normalized = String(rawParam).toLowerCase().trim();
  if (normalized === 'true' || normalized === '1') return true;
  if (normalized === 'false' || normalized === '0') return false;
  return undefined;
}

export function buildCardSearchCriteriaFromQuery(query: Record<string, unknown>): CardSearchCriteria {
  const pagination = PaginationCriteria.create({
    page: query.page as string | number | undefined,
    pageSize: query.pageSize as string | number | undefined,
    limitSize: query.limit_size as string | number | undefined,
    offset: query.offset as string | number | undefined
  });

  const rawSortOrder = String(query.sortOrder ?? 'asc').toUpperCase();
  const sortOrder: 'ASC' | 'DESC' = rawSortOrder === 'DESC' ? 'DESC' : 'ASC';

  return {
    name: query.name ? String(query.name) : undefined,
    code: query.code ? String(query.code) : undefined,
    rarity: parseMultiStringParam(query.rarity),
    frame: parseMultiStringParam(query.frame),
    archetype: parseMultiStringParam(query.archetype),
    cardType: parseMultiStringParam(query.cardType),
    alterName: query.alterName ? String(query.alterName) : undefined,
    password: query.password ? String(query.password) : undefined,
    genres: parseMultiNumberParam(query.genres),
    monsterFilters: buildMonsterFiltersFromQuery(query),
    spellType: parseMultiStringParam(query.spellType),
    trapType: parseMultiStringParam(query.trapType),
    sortBy: query.sortBy ? String(query.sortBy) : 'name',
    sortOrder,
    limitList: query.limitList ? String(query.limitList) : DEFAULT_LIMIT_LIST_NAME,
    limitFilter: parseMultiNumberParam(query.limitFilter),
    pagination
  };
}

function buildMonsterFiltersFromQuery(query: Record<string, unknown>): MonsterFilterCriteria {
  return {
    attribute: parseMultiStringParam(query.attribute),
    effectTrait: parseOptionalBoolean(query.effectTrait),
    summonMechanic: query.summonMechanic ? String(query.summonMechanic) : undefined,
    ability: parseMultiStringParam(query.ability),
    type: parseMultiStringParam(query.type),
    level: buildNumericRange(query.level, query.levelMin, query.levelMax),
    attack: buildNumericRange(query.attack, query.attackMin, query.attackMax),
    defense: buildNumericRange(query.defense, query.defenseMin, query.defenseMax)
  };
}

function buildNumericRange(
  exactRaw: unknown,
  minRaw: unknown,
  maxRaw: unknown
): NumericRangeFilter | undefined {
  const exact = parseMultiNumberParam(exactRaw);
  const min = parseOptionalInt(minRaw);
  const max = parseOptionalInt(maxRaw);

  if (!exact && min === undefined && max === undefined) {
    return undefined;
  }

  return { exact, min, max };
}

export function includesUnlimitedFilter(limitFilter?: number[]): boolean {
  return Boolean(limitFilter && limitFilter.includes(UNLIMITED_CARD_COPIES));
}

