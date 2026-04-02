package com.zosh.ai.controller;

import com.zosh.ai.payload.*;
import com.zosh.ai.service.AIService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIController {

    private final AIService aiService;

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        return ResponseEntity.ok(aiService.getChatResponse(request));
    }

    @GetMapping("/inventory-warnings")
    public ResponseEntity<List<InventoryWarningDTO>> getInventoryWarnings(@RequestParam Long storeAdminId) {
        return ResponseEntity.ok(aiService.getInventoryWarnings(storeAdminId));
    }

    @GetMapping("/recommendations")
    public ResponseEntity<List<ProductRecommendationDTO>> getRecommendations(@RequestParam Long storeAdminId) {
        return ResponseEntity.ok(aiService.getProductRecommendations(storeAdminId));
    }

    @GetMapping("/sales-predictions")
    public ResponseEntity<List<SalesPredictionDTO>> getSalesPredictions(@RequestParam Long storeAdminId) {
        return ResponseEntity.ok(aiService.getSalesPredictions(storeAdminId));
    }
}
