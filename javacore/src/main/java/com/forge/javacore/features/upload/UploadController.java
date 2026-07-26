package com.forge.javacore.features.upload;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.forge.javacore.core.storage.IStorageService;
import com.forge.javacore.core.storage.dto.UploadedFileResponse;

import java.util.Map;

@RestController
@RequestMapping("/api/upload")
public class UploadController {

    private final IStorageService storageService;

    public UploadController(IStorageService storageService) {
        this.storageService = storageService;
    }

    @PostMapping
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No file uploaded"));
        }

        UploadedFileResponse uploadedFile = storageService.uploadFile(file);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("data", uploadedFile));
    }

    @DeleteMapping
    public ResponseEntity<?> deleteFile(@RequestParam("filename") String filename) {
        if (filename == null || filename.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Filename parameter is required"));
        }

        boolean deleted = storageService.deleteFile(filename);
        if (!deleted) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "File not found or failed to delete"));
        }

        return ResponseEntity.ok(Map.of("message", "File deleted successfully"));
    }
}
