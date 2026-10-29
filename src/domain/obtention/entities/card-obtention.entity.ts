export type CanonicalObtentionMethod =
  | 'pack'
  | 'victory'
  | 'converter'
  | 'tutorial'
  | 'initial'
  | 'sandwich';

export const VALID_EXCLUSIVE_METHODS: readonly CanonicalObtentionMethod[] = [
  'pack',
  'victory',
  'converter',
  'tutorial',
  'initial',
  'sandwich'
];

export interface ObtentionMethodCount {
  method: string;
  count: number;
}

export interface CardWithObtentionEntry {
  [key: string]: unknown;
  obtention: Record<string, unknown>;
}

export interface InitialDeckObtentionResult {
  cards: CardWithObtentionEntry[];
  meta: {
    total: number;
    totalCards: number;
  };
}

export interface ExclusiveCardsResult {
  cards: CardWithObtentionEntry[];
  meta: {
    method: string;
    exclusiveCount: number;
  };
}

export interface CardObtentionDetailItem {
  sourceId?: number;
  sourceName?: string;
  details?: string;
}

export interface CardAllObtentionMethodsResult {
  card: {
    id: number;
    name: string;
  };
  obtentionMethods: Partial<Record<CanonicalObtentionMethod, CardObtentionDetailItem[]>>;
}

export function resolveCanonicalObtentionMethod(rawMethod: string): CanonicalObtentionMethod | null {
  const normalized = rawMethod.toLowerCase().trim();
  const mapping: Record<string, CanonicalObtentionMethod> = {
    pack: 'pack',
    character: 'victory',
    victory: 'victory',
    converter: 'converter',
    tutorial: 'tutorial',
    initial: 'initial',
    initial_deck: 'initial',
    sandwich: 'sandwich'
  };
  return mapping[normalized] ?? null;
}

export function computeExclusiveCardIds(
  targetMethod: CanonicalObtentionMethod,
  cardIdsByMethod: Map<CanonicalObtentionMethod, Set<number>>
): number[] {
  const targetSet = cardIdsByMethod.get(targetMethod);
  if (!targetSet) {
    return [];
  }

  return Array.from(targetSet).filter(cardId => {
    if (!cardId) return false;
    for (const [method, idSet] of cardIdsByMethod.entries()) {
      if (method !== targetMethod && idSet.has(cardId)) {
        return false;
      }
    }
    return true;
  });
}

