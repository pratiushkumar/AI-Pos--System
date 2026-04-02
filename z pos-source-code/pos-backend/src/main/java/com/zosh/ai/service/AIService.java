package com.zosh.ai.service;

import com.zosh.ai.payload.*;
import java.util.List;

public interface AIService {
    ChatResponse getChatResponse(ChatRequest request);
    List<InventoryWarningDTO> getInventoryWarnings(Long storeAdminId);
    List<ProductRecommendationDTO> getProductRecommendations(Long storeAdminId);
    List<SalesPredictionDTO> getSalesPredictions(Long storeAdminId);
}
