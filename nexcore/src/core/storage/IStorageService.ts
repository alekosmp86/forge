import type { IUploadedFile } from '@forge/shared-types';

/**
 * Storage Service Contract (SOLID Strategy Pattern).
 * Decouples upload handling from specific storage providers (Local Disk, AWS S3, GCS).
 */
export interface IStorageService {
  uploadFile(fileBuffer: Buffer, originalName: string, mimeType: string): Promise<IUploadedFile>;
  deleteFile(filename: string): Promise<boolean>;
  getFileUrl(filename: string): string;
}
