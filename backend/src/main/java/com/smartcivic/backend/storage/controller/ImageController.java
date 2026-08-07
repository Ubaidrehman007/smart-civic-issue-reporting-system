package com.smartcivic.backend.storage.controller;

import com.smartcivic.backend.storage.service.ImageStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;

import java.nio.file.Files;
import java.nio.file.Path;

@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
public class ImageController {

    private final ImageStorageService imageStorageService;

    @GetMapping("/{fileName}")
    public ResponseEntity<Resource> getImage(
            @PathVariable String fileName
    ) {

        Resource resource = imageStorageService.loadImage(fileName);

        String contentType = "application/octet-stream";

        try {
            Path path = resource.getFile().toPath();
            contentType = Files.probeContentType(path);
        } catch (Exception ignored) {
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, contentType)
                .body(resource);
    }


}