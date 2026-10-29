export interface CharacterProps {
  id: number;
  name: string;
  tier: string;
  category: string | null;
  image: string | null;
}

export interface CharacterSearchFilters {
  name?: string;
  tier?: string;
  category?: string;
}

export interface CharacterDecksPage {
  decks: Record<string, unknown>[];
  meta: {
    total: number;
    limit?: number;
    offset: number;
    hasMore: boolean;
  };
}

export class Character {
  public readonly props: CharacterProps;

  constructor(props: CharacterProps) {
    this.props = props;
  }

  public toJSON(): CharacterProps {
    return { ...this.props };
  }
}

