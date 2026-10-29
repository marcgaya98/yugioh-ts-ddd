export type LimitRestrictionStatus = 'forbidden' | 'limited' | 'semi-limited' | 'unlimited';

export const DEFAULT_LIMIT_LIST_NAME = 'Game Original';
export const UNLIMITED_CARD_COPIES = 3;

export interface CardLimitStatusProps {
  listName: string;
  status: LimitRestrictionStatus;
  limit: number;
}

export class CardLimitStatus {
  public readonly listName: string;
  public readonly status: LimitRestrictionStatus;
  public readonly limit: number;

  constructor(props: CardLimitStatusProps) {
    this.listName = props.listName;
    this.status = props.status;
    this.limit = props.limit;
  }

  public static createUnlimited(listName: string = DEFAULT_LIMIT_LIST_NAME): CardLimitStatus {
    return new CardLimitStatus({
      listName,
      status: 'unlimited',
      limit: UNLIMITED_CARD_COPIES
    });
  }

  public toJSON(): CardLimitStatusProps {
    return {
      listName: this.listName,
      status: this.status,
      limit: this.limit
    };
  }
}

