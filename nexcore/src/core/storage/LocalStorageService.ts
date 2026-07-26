import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import type { IUploadedFile } from '@forge/shared-types';
import type { IStorageService } from './IStorageService';

export class LocalStorageService implements IStorageService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), 'public', 'uploads');
  }

  private async ensureDirectoryExists(): Promise<void> {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string
  ): Promise<IUploadedFile> {
    await this.ensureDirectoryExists();

    const id = crypto.randomUUID();
    const ext = path.extname(originalName);
    const filename = `${id}${ext}`;
    const filePath = path.join(this.uploadDir, filename);

    await fs.writeFile(filePath, fileBuffer);

    return {
      id,
      filename,
      originalName,
      mimeType,
      size: fileBuffer.length,
      url: this.getFileUrl(filename),
      createdAt: new Date().toISOString(),
    };
  }

  async deleteFile(filename: string): Promise<boolean> {
    try {
      const filePath = path.join(this.uploadDir, path.basename(filename));
      await fs.unlink(filePath);
      return true;
    } catch {
      return false;
    }
  }

  getFileUrl(filename: string): string {
    return `/uploads/${filename}`;
  }
}

export const localStorageService = new LocalStorageService();
