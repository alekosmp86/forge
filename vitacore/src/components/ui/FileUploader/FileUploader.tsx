import { useState, useRef, useId } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Trash2, Image as ImageIcon } from 'lucide-react';
import styles from './FileUploader.module.css';
import { useFileUpload } from './useFileUpload';
import { FileStatus, type FileUploaderProps } from './types';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function isImageMime(mime?: string): boolean {
  return mime?.startsWith('image/') ?? false;
}

export function FileUploader({
  accept,
  maxSizeInBytes = 10 * 1024 * 1024, // 10MB
  onUploadSuccess,
  onDeleteSuccess,
  disabled = false,
  label = 'Upload File',
  hint = 'SVG, PNG, JPG, GIF or PDF (max 10MB)',
  endpointUrl = '/api/upload',
}: FileUploaderProps) {
  const fileInputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { status, progress, uploadedFile, error, upload, reset } = useFileUpload(endpointUrl);

  const handleFileSelection = async (file: File) => {
    setValidationError(null);

    if (file.size > maxSizeInBytes) {
      setValidationError(`File size exceeds limit of ${formatBytes(maxSizeInBytes)}`);
      return;
    }

    try {
      const result = await upload(file);
      if (onUploadSuccess) {
        onUploadSuccess(result);
      }
    } catch {
      // Error handled in hook state
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || status === FileStatus.UPLOADING) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileSelection(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled || status === FileStatus.UPLOADING) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      handleFileSelection(file);
    }
  };

  const handleDelete = () => {
    if (uploadedFile && onDeleteSuccess) {
      onDeleteSuccess(uploadedFile.filename);
    }
    reset();
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className={styles.container}>
      {label && <label htmlFor={fileInputId} className={styles.label}>{label}</label>}

      {status === FileStatus.IDLE || status === FileStatus.ERROR ? (
        <>
          <div
            className={[
              styles.dropzone,
              isDragging ? styles.dragging : '',
              disabled ? styles.disabled : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !disabled && inputRef.current?.click()}
            role="button"
            tabIndex={disabled ? -1 : 0}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
          >
            <span className={styles.iconWrapper}>
              <UploadCloud size={24} aria-hidden="true" />
            </span>
            <div className={styles.dropzoneTitle}>
              Drag and drop your file here, or{' '}
              <span className={styles.browseLink}>browse</span>
            </div>
            {hint && <span className={styles.hint}>{hint}</span>}

            <input
              id={fileInputId}
              ref={inputRef}
              type="file"
              accept={accept}
              disabled={disabled}
              className={styles.fileInput}
              onChange={handleInputChange}
            />
          </div>

          {(validationError || error) && (
            <div className={styles.errorMessage}>
              <AlertCircle size={14} style={{ display: 'inline', marginRight: '4px' }} />
              {validationError || error}
            </div>
          )}
        </>
      ) : (
        <div className={styles.fileCard}>
          <div className={styles.fileCardHeader}>
            <div className={styles.fileInfo}>
              <span className={styles.fileIcon}>
                {uploadedFile && isImageMime(uploadedFile.mimeType) ? (
                  <ImageIcon size={20} aria-hidden="true" />
                ) : (
                  <FileText size={20} aria-hidden="true" />
                )}
              </span>
              <div className={styles.fileDetails}>
                <span className={styles.fileName}>
                  {uploadedFile?.originalName || 'Uploading file...'}
                </span>
                <span className={styles.fileMeta}>
                  {status === FileStatus.UPLOADING
                    ? `${progress}% uploaded`
                    : uploadedFile
                    ? formatBytes(uploadedFile.size)
                    : ''}
                </span>
              </div>
            </div>

            <div className={styles.actions}>
              {status === FileStatus.SUCCESS && (
                <CheckCircle2 size={18} color="var(--color-success-500, #16a34a)" aria-hidden="true" />
              )}
              {status === FileStatus.SUCCESS && (
                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={handleDelete}
                  aria-label="Remove uploaded file"
                  title="Remove uploaded file"
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          {status === FileStatus.UPLOADING && (
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
