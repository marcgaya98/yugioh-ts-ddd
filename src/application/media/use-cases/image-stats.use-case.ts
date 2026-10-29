import {
  CardImageMetadataPort,
  DeletedCardImageResult,
  ImageFileFormat,
  ImageStoragePort,
  ImageStorageStats,
  ImageVariantType,
  MissingCardImageItem,
  OrphanImageCleanupResult,
  VALID_IMAGE_FORMATS,
  VALID_IMAGE_TYPES
} from '../../../domain/media/repositories/image-storage.port';
import { CardPassword } from '../../../domain/shared/value-objects/card-password.value-object';
import {
  EntityNotFoundError,
  InvalidParameterError
} from '../../../domain/shared/errors/domain.error';

function isValidImageVariant(value: string): value is ImageVariantType {
  return (VALID_IMAGE_TYPES as readonly string[]).includes(value);
}

function isValidImageFormat(value: string): value is ImageFileFormat {
  return (VALID_IMAGE_FORMATS as readonly string[]).includes(value);
}

export class GetImageStorageStatsUseCase {
  constructor(private readonly imageStoragePort: ImageStoragePort) {}

  public execute(): ImageStorageStats {
    return this.imageStoragePort.getStorageStats();
  }
}

export class DeleteCardImageUseCase {
  constructor(private readonly imageStoragePort: ImageStoragePort) {}

  public execute(type: string, password: string): DeletedCardImageResult {
    if (!isValidImageVariant(type)) {
      throw new InvalidParameterError('Tipo de imagen inválido');
    }

    if (!/^\d+$/.test(password)) {
      throw new InvalidParameterError('Password de carta inválido');
    }

    const passwordVo = CardPassword.createOptional(password);
    if (!passwordVo) {
      throw new InvalidParameterError('Password de carta inválido');
    }

    const deletedPaths = this.imageStoragePort.deleteCardImage(
      type,
      passwordVo.getNormalizedForUrl()
    );

    if (deletedPaths.length === 0) {
      throw new EntityNotFoundError('Image');
    }

    return {
      type,
      password,
      deletedPaths,
      timestamp: new Date().toISOString()
    };
  }
}

export class CleanupOrphanImagesUseCase {
  constructor(
    private readonly imageStoragePort: ImageStoragePort,
    private readonly cardImageMetadataPort: CardImageMetadataPort
  ) {}

  public async execute(): Promise<OrphanImageCleanupResult> {
    const validPasswords = await this.cardImageMetadataPort.findAllValidPasswords();
    return this.imageStoragePort.cleanupOrphanImages(validPasswords);
  }
}

export interface GetMissingImagesQuery {
  limit?: number;
  offset?: number;
  type?: string;
  format?: string;
}

export class GetMissingCardImagesUseCase {
  constructor(
    private readonly imageStoragePort: ImageStoragePort,
    private readonly cardImageMetadataPort: CardImageMetadataPort
  ) {}

  public async execute(query: GetMissingImagesQuery = {}) {
    const limit = Math.max(1, query.limit ?? 50);
    const offset = Math.max(0, query.offset ?? 0);
    const type = query.type ?? 'normal';
    const format = query.format ?? 'jpg';

    if (!isValidImageVariant(type)) {
      throw new InvalidParameterError('Tipo de imagen inválido');
    }

    if (!isValidImageFormat(format)) {
      throw new InvalidParameterError('Formato inválido');
    }

    const cards = await this.cardImageMetadataPort.findCardsWithPassword(limit, offset);
    const missingCards: MissingCardImageItem[] = [];

    for (const card of cards) {
      const passwordVo = CardPassword.createOptional(card.password);
      if (!passwordVo) {
        continue;
      }

      const normalizedPassword = passwordVo.getNormalizedForUrl();
      const exists = this.imageStoragePort.hasCardImage(normalizedPassword, type, format);
      if (!exists) {
        missingCards.push({
          id: card.id,
          name: card.name,
          password: card.password,
          normalizedPassword,
          expectedPath:
            format === 'jpg'
              ? `/images/cards/${type}/${normalizedPassword}.jpg`
              : `/images/cards/${type}_webp/${normalizedPassword}.webp`
        });
      }
    }

    return {
      total: missingCards.length,
      type,
      format,
      cards: missingCards,
      pagination: { limit, offset }
    };
  }
}

export class StartBulkImageDownloadUseCase {
  constructor(
    private readonly imageStoragePort: ImageStoragePort,
    private readonly cardImageMetadataPort: CardImageMetadataPort
  ) {}

  public execute() {
    void this.downloadMissingInBackground();

    return {
      message: 'Descarga de imágenes iniciada en segundo plano',
      timestamp: new Date().toISOString(),
      note: 'Consulta los logs del servidor para ver el progreso'
    };
  }

  public async downloadMissingInBackground(batchLimit = 50): Promise<number> {
    const cards = await this.cardImageMetadataPort.findCardsWithPassword(batchLimit, 0);
    let downloadedCount = 0;

    for (const card of cards) {
      const passwordVo = CardPassword.createOptional(card.password);
      if (!passwordVo) {
        continue;
      }

      const normalized = passwordVo.getNormalizedForUrl();
      for (const variant of VALID_IMAGE_TYPES) {
        if (!this.imageStoragePort.hasCardImage(normalized, variant, 'jpg')) {
          try {
            await this.imageStoragePort.downloadCardImageOnDemand(variant, normalized);
            downloadedCount++;
          } catch {
            // Ignorar fallos individuales en proceso background
          }
        }
      }
    }

    return downloadedCount;
  }
}
