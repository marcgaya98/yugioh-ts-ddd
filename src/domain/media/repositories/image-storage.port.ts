export const VALID_IMAGE_TYPES = ['normal', 'small', 'cropped'] as const;
export const VALID_IMAGE_FORMATS = ['jpg', 'webp'] as const;

export type ImageVariantType = (typeof VALID_IMAGE_TYPES)[number];
export type ImageFileFormat = (typeof VALID_IMAGE_FORMATS)[number];

export interface ImageStorageStats {
  baseDirectory: string;
  imageTypes: string[];
  webpTypes: string[];
  totalImages: number;
  totalWebp: number;
  totalSize: number;
  totalSizeFormatted: string;
  timestamp: string;
  [key: string]: unknown;
}

export interface DeletedCardImageResult {
  type: ImageVariantType;
  password: string;
  deletedPaths: string[];
  timestamp: string;
}

export interface OrphanImageCleanupItem {
  type: string;
  password: string;
  size: number;
  ext: ImageFileFormat;
}

export interface OrphanImageCleanupResult {
  deletedCount: number;
  deletedSize: number;
  deletedSizeFormatted: string;
  deletedFiles: Array<OrphanImageCleanupItem | { note: string }>;
  timestamp: string;
}

export interface CardPasswordRecord {
  id: number;
  name: string;
  password: string;
}

export interface MissingCardImageItem {
  id: number;
  name: string;
  password: string;
  normalizedPassword: string;
  expectedPath: string;
}

export interface ImageStoragePort {
  getStorageStats(): ImageStorageStats;
  hasCardImage(
    normalizedPassword: string,
    variant: ImageVariantType,
    format: ImageFileFormat
  ): boolean;
  resolveLocalJpgPath(variant: ImageVariantType, normalizedPassword: string): string;
  deleteCardImage(variant: ImageVariantType, normalizedPassword: string): string[];
  cleanupOrphanImages(validPasswords: Set<string>): OrphanImageCleanupResult;
  downloadCardImageOnDemand(
    variant: ImageVariantType,
    normalizedPassword: string
  ): Promise<string>;
}

export interface CardImageMetadataPort {
  findAllValidPasswords(): Promise<Set<string>>;
  findCardsWithPassword(limit: number, offset: number): Promise<CardPasswordRecord[]>;
}
