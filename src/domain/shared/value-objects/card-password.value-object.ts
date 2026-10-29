import { DomainValidationError } from '../errors/domain.error';

const PASSWORD_DIGITS_LENGTH = 8;
const EIGHT_DIGIT_REGEX = /^\d{8}$/;

export interface CardImageVariants {
  normal: string;
  small: string;
  cropped: string;
}

export class CardPassword {
  private readonly rawValue: string;

  private constructor(rawValue: string) {
    this.rawValue = rawValue;
  }

  public static create(value: string): CardPassword {
    const trimmed = String(value).trim();
    if (!EIGHT_DIGIT_REGEX.test(trimmed)) {
      throw new DomainValidationError('Card password must be exactly 8 numeric digits');
    }
    return new CardPassword(trimmed);
  }

  public static createOptional(value?: string | null): CardPassword | null {
    if (!value || String(value).trim() === '') {
      return null;
    }
    const digitsOnly = String(value).replace(/\D/g, '');
    if (digitsOnly.length === 0) {
      return null;
    }
    const padded = digitsOnly.padStart(PASSWORD_DIGITS_LENGTH, '0').slice(0, PASSWORD_DIGITS_LENGTH);
    return new CardPassword(padded);
  }

  public getValue(): string {
    return this.rawValue;
  }

  public getNormalizedForUrl(): string {
    const withoutLeadingZeros = this.rawValue.replace(/^0+/, '');
    return withoutLeadingZeros || '0';
  }

  public buildListImageUrl(): string {
    return `/images/cards/normal/${this.rawValue}.jpg`;
  }

  public buildImageVariants(baseUrl = ''): CardImageVariants {
    const normalized = this.getNormalizedForUrl();
    return {
      normal: `${baseUrl}/images/cards/normal/${normalized}.jpg`,
      small: `${baseUrl}/images/cards/small/${normalized}.jpg`,
      cropped: `${baseUrl}/images/cards/cropped/${normalized}.jpg`
    };
  }

  public equals(other: CardPassword): boolean {
    return this.rawValue === other.rawValue;
  }
}

