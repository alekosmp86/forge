package com.forge.javacore.core.storage;

import org.springframework.web.multipart.MultipartFile;
import com.forge.javacore.core.storage.dto.UploadedFileResponse;

/**
 * Storage Service Interface (SOLID Strategy Pattern).
 * Decouples file uploads from specific storage implementations (Local Disk, AWS S3, GCS).
 */
public interface IStorageService {
    UploadedFileResponse uploadFile(MultipartFile file);
    boolean deleteFile(String filename);
    String getFileUrl(String filename);
}
