const DEFAULT_PAGE_NUMBER = 1;
const DEFAULT_PAGE_SIZE = 24;
const MIN_PAGE_SIZE = 1;
const MAX_PAGE_SIZE = 100;

export interface RawPaginationInput {
  page?: number | string;
  pageSize?: number | string;
  limitSize?: number | string;
  offset?: number | string;
}

export interface PaginationMetadata {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  warning?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationMetadata;
}

export class PaginationCriteria {
  public readonly page: number;
  public readonly pageSize: number;
  public readonly offset: number;

  private constructor(page: number, pageSize: number, offset: number) {
    this.page = page;
    this.pageSize = pageSize;
    this.offset = offset;
  }

  public static create(input: RawPaginationInput = {}): PaginationCriteria {
    const resolvedPageSize = PaginationCriteria.resolvePageSize(input.pageSize ?? input.limitSize);
    const resolvedPage = PaginationCriteria.resolvePositiveInt(input.page, DEFAULT_PAGE_NUMBER);
    const resolvedOffset = PaginationCriteria.resolveOffset(input.offset, resolvedPage, resolvedPageSize);

    return new PaginationCriteria(resolvedPage, resolvedPageSize, resolvedOffset);
  }

  public buildMetadata(totalItems: number, warningMessage?: string): PaginationMetadata {
    const totalPages = Math.ceil(totalItems / this.pageSize);
    const metadata: PaginationMetadata = {
      total: totalItems,
      page: this.page,
      pageSize: this.pageSize,
      totalPages,
      hasNext: this.page < totalPages,
      hasPrev: this.page > DEFAULT_PAGE_NUMBER
    };

    if (warningMessage) {
      metadata.warning = warningMessage;
    }

    return metadata;
  }

  private static resolvePageSize(rawSize?: number | string): number {
    if (rawSize === undefined || rawSize === '') {
      return DEFAULT_PAGE_SIZE;
    }
    const parsedSize = Number(rawSize);
    if (Number.isNaN(parsedSize)) {
      return DEFAULT_PAGE_SIZE;
    }
    return Math.min(Math.max(Math.trunc(parsedSize), MIN_PAGE_SIZE), MAX_PAGE_SIZE);
  }

  private static resolvePositiveInt(rawValue: number | string | undefined, fallback: number): number {
    if (rawValue === undefined || rawValue === '') {
      return fallback;
    }
    const parsedValue = Number(rawValue);
    if (Number.isNaN(parsedValue)) {
      return fallback;
    }
    return Math.max(Math.trunc(parsedValue), MIN_PAGE_SIZE);
  }

  private static resolveOffset(
    rawOffset: number | string | undefined,
    page: number,
    pageSize: number
  ): number {
    if (rawOffset !== undefined && rawOffset !== '') {
      const parsedOffset = Number(rawOffset);
      if (!Number.isNaN(parsedOffset)) {
        return Math.max(Math.trunc(parsedOffset), 0);
      }
    }
    return (page - DEFAULT_PAGE_NUMBER) * pageSize;
  }
}

