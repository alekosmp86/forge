import type { IUploadedFile } from '@forge/shared-types';

export const FileStatus = {
  IDLE: 'idle',
  UPLOADING: 'uploading',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

export type FileStatus = (typeof FileStatus)[keyof typeof FileStatus];

export interface FileUploaderProps {
  accept?: string;
  maxSizeInBytes?: number; // Default: 10MB (10 * 1024 * 1024)
  onUploadSuccess?: (file: IUploadedFile) => void;
  onDeleteSuccess?: (filename: string) => void;
  disabled?: boolean;
  label?: string;
  hint?: string;
  endpointUrl?: string; // Default: '/api/upload'
}

export interface UploadState {
  status: FileStatus;
  progress: number;
  uploadedFile: IUploadedFile | null;
  error: string | null;
}
