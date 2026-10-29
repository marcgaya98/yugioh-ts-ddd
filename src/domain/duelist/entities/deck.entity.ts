export interface DeckOwnerSummary {
  id: number;
  name: string;
  tier?: string;
}

export interface DeckSearchFilters {
  name?: string;
  level?: number;
  characterId?: number;
}

export interface DeckProps {
  id: string;
  name: string;
  level: number;
  characterId: number | null;
  extraDeck: boolean;
  owner?: DeckOwnerSummary | null;
  cards?: Record<string, unknown>[];
}

export class Deck {
  public readonly props: DeckProps;

  constructor(props: DeckProps) {
    this.props = props;
  }

  public toJSON(): DeckProps {
    return { ...this.props };
  }
}

