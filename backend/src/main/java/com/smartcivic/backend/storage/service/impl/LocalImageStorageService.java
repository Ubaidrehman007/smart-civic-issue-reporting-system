package com.smartcivic.backend.storage.service.impl;

import com.smartcivic.backend.config.FileStorageProperties;
import com.smartcivic.backend.storage.service.ImageStorageService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class LocalImageStorageService implements ImageStorageService {

    private final Path fileStorageLocation;

    public LocalImageStorageService(FileStorageProperties properties) {

        this.fileStorageLocation = Paths.get(properties.getUploadDir())
                .toAbsolutePath()
                .normalize();

        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (IOException ex) {
            throw new RuntimeException("Could not create upload directory.", ex);
        }
    }

    @Override
    public String storeImage(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File must not be empty.");
        }

        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());

        if (originalFileName.contains("..")) {
            throw new IllegalArgumentException("Invalid file name.");
        }

        String fileExtension = "";

        int dotIndex = originalFileName.lastIndexOf('.');

        if (dotIndex > 0) {
            fileExtension = originalFileName.substring(dotIndex);
        }

        String storedFileName = UUID.randomUUID() + fileExtension;

        Path targetLocation = this.fileStorageLocation.resolve(storedFileName);

        try {

            Files.copy(
                    file.getInputStream(),
                    targetLocation,
                    StandardCopyOption.REPLACE_EXISTING
            );

        } catch (IOException ex) {

            throw new RuntimeException("Could not store file.", ex);

        }

        return storedFileName;
    }


    @Override
    public Resource loadImage(String fileName) {

        try {

            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();

            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            }

            throw new RuntimeException("File not found: " + fileName);

        } catch (MalformedURLException ex) {

            throw new RuntimeException("File not found: " + fileName, ex);

        }

    }

    @Override
    public void deleteImage(String fileName) {

        try {

            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();

            Files.deleteIfExists(filePath);

        } catch (IOException ex) {

            throw new RuntimeException("Could not delete file: " + fileName, ex);

        }

    }
}