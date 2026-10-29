import { CardPassword, CardImageVariants } from '../../shared/value-objects/card-password.value-object';
import { CardLimitStatus, CardLimitStatusProps } from '../../limit-list/value-objects/limit-status.value-object';
import { Genre, GenreProps } from './genre.entity';

export type CardRarityValue = 'ultra' | 'super' | 'rare' | 'common';
export type CardFrameValue = 'normal' | 'effect' | 'fusion' | 'ritual' | 'spell' | 'trap' | 'token';
export type CardKindValue = 'Monster' | 'Spell' | 'Trap';

export interface MonsterDataProps {
  cardId: number;
  attribute: string;
  effectTrait: boolean;
  summonMechanic: string | null;
  ability: string | null;
  type: string;
  level: number;
  attack: number | null;
  defense: number | null;
}

export interface SpellDataProps {
  cardId?: number;
  type: string;
}

export interface TrapDataProps {
  cardId?: number;
  type: string;
}

export interface CardProps {
  id: number;
  name: string;
  code: string;
  description: string;
  imageUrl: string | null;
  password: string | null;
  rarity: CardRarityValue;
  frame: CardFrameValue;
  archetype: string | null;
  cardType: CardKindValue;
  alterName: string | null;
  genres?: Genre[];
  monsterData?: MonsterDataProps | null;
  spellData?: SpellDataProps | null;
  trapData?: TrapDataProps | null;
}

export interface CardListItemPresentation {
  id: number;
  name: string;
  code: string;
  description: string;
  image_url: string | null;
  password: string | null;
  rarity: CardRarityValue;
  frame: CardFrameValue;
  archetype: string | null;
  cardType: CardKindValue;
  alter_name: string | null;
  genres: GenreProps[];
  monsterData: MonsterDataProps | null;
  spellData: SpellDataProps | null;
  trapData: TrapDataProps | null;
  limitStatus: CardLimitStatusProps;
}

export interface CardDetailPresentation {
  id: number;
  name: string;
  code: string;
  description: string;
  image_url: string | null;
  password: string | null;
  rarity: CardRarityValue;
  frame: CardFrameValue;
  archetype: string | null;
  cardType: CardKindValue;
  alter_name: string | null;
  genres: GenreProps[];
  monsterData: MonsterDataProps | null;
  spellData: SpellDataProps | null;
  trapData: TrapDataProps | null;
  images: CardImageVariants | null;
}

export class Card {
  public readonly props: CardProps;
  private readonly passwordVO: CardPassword | null;

  constructor(props: CardProps) {
    this.props = props;
    this.passwordVO = CardPassword.createOptional(props.password);
  }

  get id(): number {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get password(): string | null {
    return this.props.password;
  }

  public toListItem(limitStatus: CardLimitStatus): CardListItemPresentation {
    const resolvedImageUrl = this.props.password
      ? `/images/cards/normal/${this.props.password}.jpg`
      : null;

    return {
      ...this.buildBasePlainObject(),
      image_url: resolvedImageUrl,
      limitStatus: limitStatus.toJSON()
    };
  }

  public toDetailWithImages(baseUrl = ''): CardDetailPresentation {
    return {
      ...this.buildBasePlainObject(),
      image_url: this.props.imageUrl,
      images: this.passwordVO ? this.passwordVO.buildImageVariants(baseUrl) : null
    };
  }

  private buildBasePlainObject() {
    return {
      id: this.props.id,
      name: this.props.name,
      code: this.props.code,
      description: this.props.description,
      password: this.props.password,
      rarity: this.props.rarity,
      frame: this.props.frame,
      archetype: this.props.archetype,
      cardType: this.props.cardType,
      alter_name: this.props.alterName,
      genres: (this.props.genres ?? []).map(genre => genre.toJSON()),
      monsterData: this.props.monsterData ?? null,
      spellData: this.props.spellData ?? null,
      trapData: this.props.trapData ?? null
    };
  }
}

