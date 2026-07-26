'use client';

import { useState, useCallback } from 'react';
import type { IUploadedFile } from '@forge/shared-types';
import { FileStatus, type UploadState } from './types';

export function useFileUpload(endpointUrl: string = '/api/upload') {
  const [state, setState] = useState<UploadState>({
    status: FileStatus.IDLE,
    progress: 0,
    uploadedFile: null,
    error: null,
  });

  const upload = useCallback(
    (file: File): Promise<IUploadedFile> => {
      return new Promise((resolve, reject) => {
        setState({
          status: FileStatus.UPLOADING,
          progress: 0,
          uploadedFile: null,
          error: null,
        });

        const formData = new FormData();
        formData.append('file', file);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', endpointUrl, true);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setState((prev) => ({ ...prev, progress: percent }));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const result = JSON.parse(xhr.responseText);
              const uploadedFile: IUploadedFile = result.data;
              setState({
                status: FileStatus.SUCCESS,
                progress: 100,
                uploadedFile,
                error: null,
              });
              resolve(uploadedFile);
            } catch {
              const err = 'Failed to parse upload response';
              setState({
                status: FileStatus.ERROR,
                progress: 0,
                uploadedFile: null,
                error: err,
              });
              reject(new Error(err));
            }
          } else {
            let err = 'Upload failed';
            try {
              const result = JSON.parse(xhr.responseText);
              if (result.error) err = result.error;
            } catch {
              // fallback
            }
            setState({
              status: FileStatus.ERROR,
              progress: 0,
              uploadedFile: null,
              error: err,
            });
            reject(new Error(err));
          }
        };

        xhr.onerror = () => {
          const err = 'Network error during file upload';
          setState({
            status: FileStatus.ERROR,
            progress: 0,
            uploadedFile: null,
            error: err,
          });
          reject(new Error(err));
        };

        xhr.send(formData);
      });
    },
    [endpointUrl]
  );

  const reset = useCallback(() => {
    setState({
      status: FileStatus.IDLE,
      progress: 0,
      uploadedFile: null,
      error: null,
    });
  }, []);

  return { ...state, upload, reset };
}
