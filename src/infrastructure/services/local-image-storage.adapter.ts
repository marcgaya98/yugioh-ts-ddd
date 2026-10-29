import fs from 'fs';
import path from 'path';
import {
  ImageFileFormat,
  ImageStoragePort,
  ImageStorageStats,
  ImageVariantType,
  OrphanImageCleanupItem,
  OrphanImageCleanupResult,
  VALID_IMAGE_TYPES
} from '../../domain/media/repositories/image-storage.port';

const BYTES_PER_KB = 1024;
const SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const;
const MAX_REPORTED_DELETED_FILES = 10;

const YGOPRODECK_VARIANT_SUFFIX: Readonly<Record<ImageVariantType, string>> = {
  normal: '',
  small: '_small',
  cropped: '_cropped'
};

export function resolvePublicDirectory(): string {
  if (process.env.PUBLIC_DIR && fs.existsSync(process.env.PUBLIC_DIR)) {
    return path.resolve(process.env.PUBLIC_DIR);
  }
  const projectRoot = path.resolve(__dirname, '../../..');
  const localPublic = path.resolve(projectRoot, 'public');
  if (fs.existsSync(path.join(localPublic, 'images', 'cards'))) {
    return localPublic;
  }
  return path.resolve(projectRoot, '../yugioh/public');
}

export class LocalImageStorageAdapter implements ImageStoragePort {
  private readonly baseImageDir: string;
  private readonly activeDownloads = new Map<string, Promise<string>>();

  constructor(baseImageDir?: string) {
    this.baseImageDir =
      baseImageDir ?? path.join(resolvePublicDirectory(), 'images', 'cards');
  }

  public getStorageStats(): ImageStorageStats {
    const imageTypes = [...VALID_IMAGE_TYPES];
    const webpTypes = imageTypes.map(type => `${type}_webp`);

    const stats: ImageStorageStats = {
      baseDirectory: this.baseImageDir,
      imageTypes,
      webpTypes,
      totalImages: 0,
      totalWebp: 0,
      totalSize: 0,
      totalSizeFormatted: '0 B',
      timestamp: new Date().toISOString()
    };

    for (const variant of imageTypes) {
      const { count, totalBytes } = this.measureDirectory(variant, '.jpg');
      stats[`${variant}Count`] = count;
      stats[`${variant}Size`] = totalBytes;
      stats[`${variant}SizeFormatted`] = this.formatBytes(totalBytes);
      stats.totalImages += count;
      stats.totalSize += totalBytes;
    }

    for (const variant of webpTypes) {
      const { count, totalBytes } = this.measureDirectory(variant, '.webp');
      stats[`${variant}Count`] = count;
      stats[`${variant}Size`] = totalBytes;
      stats[`${variant}SizeFormatted`] = this.formatBytes(totalBytes);
      stats.totalWebp += count;
      stats.totalSize += totalBytes;
    }

    stats.totalSizeFormatted = this.formatBytes(stats.totalSize);
    return stats;
  }

  public hasCardImage(
    normalizedPassword: string,
    variant: ImageVariantType,
    format: ImageFileFormat
  ): boolean {
    const folder = format === 'jpg' ? variant : `${variant}_webp`;
    const filePath = path.join(this.baseImageDir, folder, `${normalizedPassword}.${format}`);
    return fs.existsSync(filePath);
  }

  public resolveLocalJpgPath(variant: ImageVariantType, normalizedPassword: string): string {
    return path.join(this.baseImageDir, variant, `${normalizedPassword}.jpg`);
  }

  public deleteCardImage(variant: ImageVariantType, normalizedPassword: string): string[] {
    const jpgPath = path.join(this.baseImageDir, variant, `${normalizedPassword}.jpg`);
    const webpPath = path.join(
      this.baseImageDir,
      `${variant}_webp`,
      `${normalizedPassword}.webp`
    );

    const deletedPaths: string[] = [];
    for (const candidatePath of [jpgPath, webpPath]) {
      if (fs.existsSync(candidatePath)) {
        fs.unlinkSync(candidatePath);
        deletedPaths.push(candidatePath);
      }
    }

    return deletedPaths;
  }

  public cleanupOrphanImages(validPasswords: Set<string>): OrphanImageCleanupResult {
    const deletedFiles: OrphanImageCleanupItem[] = [];
    let deletedSize = 0;

    for (const variant of VALID_IMAGE_TYPES) {
      deletedSize += this.removeOrphansInFolder(variant, 'jpg', validPasswords, deletedFiles);
      deletedSize += this.removeOrphansInFolder(
        `${variant}_webp`,
        'webp',
        validPasswords,
        deletedFiles
      );
    }

    const reportedFiles =
      deletedFiles.length > MAX_REPORTED_DELETED_FILES
        ? [
            ...deletedFiles.slice(0, MAX_REPORTED_DELETED_FILES),
            { note: `... y ${deletedFiles.length - MAX_REPORTED_DELETED_FILES} más` }
          ]
        : deletedFiles;

    return {
      deletedCount: deletedFiles.length,
      deletedSize,
      deletedSizeFormatted: this.formatBytes(deletedSize),
      deletedFiles: reportedFiles,
      timestamp: new Date().toISOString()
    };
  }

  public async downloadCardImageOnDemand(
    variant: ImageVariantType,
    normalizedPassword: string
  ): Promise<string> {
    const localPath = this.resolveLocalJpgPath(variant, normalizedPassword);
    if (fs.existsSync(localPath)) {
      return localPath;
    }

    const cacheKey = `${variant}:${normalizedPassword}`;
    const existingTask = this.activeDownloads.get(cacheKey);
    if (existingTask) {
      return existingTask;
    }

    const downloadTask = this.performRemoteImageDownload(variant, normalizedPassword, localPath);
    this.activeDownloads.set(cacheKey, downloadTask);

    try {
      return await downloadTask;
    } finally {
      this.activeDownloads.delete(cacheKey);
    }
  }

  private async performRemoteImageDownload(
    variant: ImageVariantType,
    normalizedPassword: string,
    destinationPath: string
  ): Promise<string> {
    const suffix = YGOPRODECK_VARIANT_SUFFIX[variant];
    const remoteUrl = `https://images.ygoprodeck.com/images/cards${suffix}/${normalizedPassword}.jpg`;

    const response = await fetch(remoteUrl, {
      headers: {
        'User-Agent': 'YuGiOhDB/1.0 (Image Cache System)',
        Accept: 'image/jpeg,image/*,*/*'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.startsWith('image/')) {
      throw new Error(`Invalid content-type: ${contentType}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    if (buffer.byteLength === 0) {
      throw new Error('Downloaded image buffer is empty');
    }

    const directory = path.dirname(destinationPath);
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    fs.writeFileSync(destinationPath, buffer);
    return destinationPath;
  }

  private removeOrphansInFolder(
    folderName: string,
    format: ImageFileFormat,
    validPasswords: Set<string>,
    deletedFiles: OrphanImageCleanupItem[]
  ): number {
    const folderPath = path.join(this.baseImageDir, folderName);
    if (!fs.existsSync(folderPath)) {
      return 0;
    }

    const extension = `.${format}`;
    const files = fs.readdirSync(folderPath).filter(file => file.endsWith(extension));
    let removedBytes = 0;

    for (const file of files) {
      const password = file.slice(0, -extension.length);
      if (validPasswords.has(password)) {
        continue;
      }

      const fullPath = path.join(folderPath, file);
      const stat = fs.statSync(fullPath);
      fs.unlinkSync(fullPath);
      removedBytes += stat.size;
      deletedFiles.push({
        type: folderName,
        password,
        size: stat.size,
        ext: format
      });
    }

    return removedBytes;
  }

  private measureDirectory(
    folderName: string,
    extension: string
  ): { count: number; totalBytes: number } {
    const folderPath = path.join(this.baseImageDir, folderName);
    if (!fs.existsSync(folderPath)) {
      return { count: 0, totalBytes: 0 };
    }

    const files = fs.readdirSync(folderPath).filter(file => file.endsWith(extension));
    let totalBytes = 0;

    for (const file of files) {
      const fileStat = fs.statSync(path.join(folderPath, file));
      totalBytes += fileStat.size;
    }

    return { count: files.length, totalBytes };
  }

  private formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 B';
    const unitIndex = Math.floor(Math.log(bytes) / Math.log(BYTES_PER_KB));
    const value = Number.parseFloat(
      (bytes / Math.pow(BYTES_PER_KB, unitIndex)).toFixed(Math.max(decimals, 0))
    );
    return `${value} ${SIZE_UNITS[unitIndex]}`;
  }
}
