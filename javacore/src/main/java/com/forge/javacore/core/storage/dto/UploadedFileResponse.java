package com.forge.javacore.core.storage.dto;

import java.time.Instant;
import java.util.UUID;

public record UploadedFileResponse(
    UUID id,
    String filename,
    String originalName,
    String mimeType,
    long size,
    String url,
    Instant createdAt
) {}
