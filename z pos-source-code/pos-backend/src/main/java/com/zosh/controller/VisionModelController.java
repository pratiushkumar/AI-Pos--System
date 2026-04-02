package com.zosh.controller;

import com.zosh.modal.Store;
import com.zosh.service.StoreService;
import com.zosh.service.UserService;
import com.zosh.modal.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

/**
 * Controller for multi-tenant Computer Vision model management.
 * Allows each shop owner to upload training images and trigger their own model training.
 */
@RestController
@RequestMapping("/api/vision")
@RequiredArgsConstructor
@Slf4j
public class VisionModelController {

    private final StoreService storeService;
    private final UserService userService;

    // Base path for multi-tenant training data
    private final String BASE_UPLOAD_PATH = "uploads/vision-training";

    /**
     * Upload training images for a specific product in a store.
     * Each store owner has their own isolated directory for training data.
     */
    @PostMapping("/upload/{productId}")
    @PreAuthorize("hasAuthority('ROLE_STORE_ADMIN')")
    public ResponseEntity<String> uploadTrainingImages(
            @PathVariable Long productId,
            @RequestParam("files") MultipartFile[] files) throws IOException {
        
        User user = userService.getCurrentUser();
        Store store = storeService.findByStoreAdminId(user.getId());
        
        if (store == null) {
            return ResponseEntity.badRequest().body("User not associated with any store");
        }

        Path trainPath = Paths.get(BASE_UPLOAD_PATH, "store-" + store.getId(), "product-" + productId);
        Files.createDirectories(trainPath);

        for (MultipartFile file : files) {
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Files.write(trainPath.resolve(fileName), file.getBytes());
        }

        log.info("Uploaded {} training images for store {} and product {}", 
            files.length, store.getId(), productId);
        
        return ResponseEntity.ok("Successfully uploaded training images for store " + store.getId());
    }

    /**
     * Trigger training for the store's custom model.
     * In a production environment, this would queue a task for a cloud training worker.
     */
    @PostMapping("/train")
    @PreAuthorize("hasAuthority('ROLE_STORE_ADMIN')")
    public ResponseEntity<String> triggerTraining() {
        User user = userService.getCurrentUser();
        Store store = storeService.findByStoreAdminId(user.getId());

        if (store == null) {
            return ResponseEntity.badRequest().body("Store not found");
        }

        // TODO: In real-world, call an async service to trigger YOLO training
        log.info("Initiating model training for store: {}", store.getBrand());
        
        return ResponseEntity.ok("Training initiated for " + store.getBrand() + ". You will be notified via email upon completion.");
    }

    /**
     * Get the store's custom model details.
     */
    @GetMapping("/model-status")
    @PreAuthorize("hasAuthority('ROLE_STORE_ADMIN')")
    public ResponseEntity<String> getModelStatus() {
        User user = userService.getCurrentUser();
        Store store = storeService.findByStoreAdminId(user.getId());
        
        String modelUrl = store.getVisionModelUrl();
        if (modelUrl == null || modelUrl.isEmpty()) {
            return ResponseEntity.ok("No custom model trained yet for this store.");
        }
        
        return ResponseEntity.ok("Your custom model is active and located at: " + modelUrl);
    }
}
