package com.smartcivic.backend.storage.service.impl;

import com.smartcivic.backend.config.FileStorageProperties;
import com.smartcivic.backend.storage.service.ImageStorageService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
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
            throw new IllegalArgumentException(
                    "File must not be empty."
            );
        }

        final long maxFileSize = 5L * 1024 * 1024;

        if (file.getSize() > maxFileSize) {
            throw new IllegalArgumentException(
                    "Image size must not exceed 5 MB."
            );
        }

        try {

            BufferedImage image =
                    ImageIO.read(file.getInputStream());

            if (image == null) {
                throw new IllegalArgumentException(
                        "Uploaded file is not a valid image."
                );
            }

            if (image.getWidth() > 8000 ||
                    image.getHeight() > 8000) {

                throw new IllegalArgumentException(
                        "Image dimensions are too large."
                );
            }

            String contentType =
                    file.getContentType();

            if (contentType == null ||
                    (!contentType.equalsIgnoreCase("image/jpeg")
                            && !contentType.equalsIgnoreCase("image/png")
                            && !contentType.equalsIgnoreCase("image/gif"))) {

                throw new IllegalArgumentException(
                        "Only JPEG, PNG and GIF images are allowed."
                );
            }

            String extension;

            if (contentType.equalsIgnoreCase("image/jpeg")) {
                extension = ".jpg";
            } else if (contentType.equalsIgnoreCase("image/png")) {
                extension = ".png";
            } else {
                extension = ".gif";
            }

            String storedFileName =
                    UUID.randomUUID() + extension;

            Path targetLocation =
                    fileStorageLocation
                            .resolve(storedFileName)
                            .normalize();

            if (!targetLocation.startsWith(
                    fileStorageLocation
            )) {
                throw new IllegalArgumentException(
                        "Invalid file path."
                );
            }

            Files.copy(
                    file.getInputStream(),
                    targetLocation,
                    StandardCopyOption.REPLACE_EXISTING
            );

            return storedFileName;

        } catch (IOException ex) {

            throw new RuntimeException(
                    "Could not store image.",
                    ex
            );
        }
    }


    @Override
    public Resource loadImage(String fileName) {

        try {

            Path filePath =
                    this.fileStorageLocation
                            .resolve(fileName)
                            .normalize();

            if (!filePath.startsWith(
                    this.fileStorageLocation
            )) {
                throw new IllegalArgumentException(
                        "Invalid file path."
                );
            }

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

            Path filePath =
                    this.fileStorageLocation
                            .resolve(fileName)
                            .normalize();

            if (!filePath.startsWith(
                    this.fileStorageLocation
            )) {
                throw new IllegalArgumentException(
                        "Invalid file path."
                );
            }

            Files.deleteIfExists(filePath);

        } catch (IOException ex) {

            throw new RuntimeException("Could not delete file: " + fileName, ex);

        }

    }
}