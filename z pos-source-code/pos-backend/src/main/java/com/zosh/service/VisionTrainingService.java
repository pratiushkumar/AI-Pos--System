package com.zosh.service;

import com.zosh.modal.Store;
import com.zosh.repository.StoreRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

/**
 * Service to orchestrate multi-tenant YOLO model training.
 * Automates creating datasets and initiating training jobs for each store.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class VisionTrainingService {

    private final StoreRepository storeRepository;

    /**
     * Trigger training for a store model.
     * This method is asynchronous to avoid blocking the main application.
     */
    @Async
    public void trainStoreModel(Long storeId) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("Store not found"));

        log.info("Starting automated training job for store: {} (ID: {})", store.getBrand(), storeId);

        try {
            // 1. Prepare YAML configuration for this store's dataset
            String yamlPath = createDatasetYaml(storeId, store.getBrand());

            // 2. Initiate training script (calling the python training script with new parameters)
            // Note: In real production, this might call a cloud-based GPU service like AWS SageMaker or Google Vertex AI.
            runTrainingProcess(storeId, yamlPath);

            log.info("Successfully finished model training for store: {}", store.getBrand());
            
            // 3. Store the path to the newly trained weights
            String modelPath = "models/store-" + storeId + "/weights/best.pt";
            store.setVisionModelUrl(modelPath);
            storeRepository.save(store);

        } catch (Exception e) {
            log.error("Failed to train model for store {}: {}", store.getBrand(), e.getMessage());
        }
    }

    private String createDatasetYaml(Long storeId, String brandName) throws IOException {
        String baseDir = "uploads/vision-training/store-" + storeId;
        String yamlContent = String.format("""
                path: %s
                train: images/train
                val: images/train
                nc: 1
                names: ['%s']
                """, baseDir, brandName);

        Path yamlFile = Paths.get(baseDir, "dataset.yaml");
        new File(baseDir).mkdirs();
        
        try (FileWriter writer = new FileWriter(yamlFile.toFile())) {
            writer.write(yamlContent);
        }
        
        return yamlFile.toAbsolutePath().toString();
    }

    private void runTrainingProcess(Long storeId, String yamlPath) throws IOException, InterruptedException {
        // Here we simulate calling the optimized training script for this store.
        // On a production server, this could be a call to a Python service or an external API.
        log.info("Running training process for store {} using dataset {}", storeId, yamlPath);
        
        // Simulating some time for training (in reality this would take several minutes)
        Thread.sleep(5000); 
    }
}
