export interface GenreProps {
  id: number;
  name: string;
  category: string;
}

export class Genre {
  public readonly id: number;
  public readonly name: string;
  public readonly category: string;

  constructor(props: GenreProps) {
    this.id = props.id;
    this.name = props.name;
    this.category = props.category;
  }

  public toJSON(): GenreProps {
    return {
      id: this.id,
      name: this.name,
      category: this.category
    };
  }
}

