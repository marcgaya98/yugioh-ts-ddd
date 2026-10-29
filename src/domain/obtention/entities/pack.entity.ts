export interface PackProps {
  id: number;
  name: string;
  price: number;
  image_url: string;
  unlock_methods: string | null;
  card_count: number | null;
  total_cards: number | null;
  description: string | null;
  description_extra: string | null;
  cover_card: string | null;
}

export class Pack {
  public readonly props: PackProps;

  constructor(props: PackProps) {
    this.props = props;
  }

  get id(): number {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  public toJSON(): PackProps {
    return { ...this.props };
  }
}

