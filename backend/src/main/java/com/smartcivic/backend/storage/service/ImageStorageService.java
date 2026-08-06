package com.smartcivic.backend.storage.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface ImageStorageService {

    /**
     * Stores an uploaded image and returns its unique filename.
     */
    String storeImage(MultipartFile file);

    /**
     * Loads an image as a Spring Resource.
     */
    Resource loadImage(String fileName);

    /**
     * Deletes an image from storage.
     */
    void deleteImage(String fileName);
}