package com.zosh.ai.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zosh.ai.payload.*;
import com.zosh.ai.service.AIService;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class OpenAIService implements AIService {
    // System prompt used for Gemini AI requests
    private static final String AI_SYSTEM_PROMPT = "You are a helpful AI assistant for a Point of Sale (POS) store management system. You help store owners and managers with questions about inventory, sales, products, orders, customers, and business insights. Be concise and helpful.";

    @Value("${spring.ai.google.api-key:}")
    private String geminiApiKey;

    private static final String GEMINI_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=";

    private final OkHttpClient httpClient = new OkHttpClient.Builder()
            .connectTimeout(10, TimeUnit.SECONDS)
            .readTimeout(15, TimeUnit.SECONDS)
            .build();

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public ChatResponse getChatResponse(ChatRequest request) {
        log.info("Generating AI chat response for message: {}", request.getMessage());

        // Try Gemini API if key is configured
        if (geminiApiKey != null && !geminiApiKey.isBlank()) {
            try {
                String reply = callGemini(request.getMessage());
                return ChatResponse.builder()
                        .reply(reply)
                        .model("gemini-2.0-flash")
                        .timestamp(System.currentTimeMillis())
                        .build();
            } catch (Exception e) {
                log.error("Gemini API error: {}", e.getMessage());
            }
        }

        // Smart POS-aware fallback — always responds meaningfully
        String reply = getPosSmartreply(request.getMessage());
        return ChatResponse.builder()
                .reply(reply)
                .model("smart-fallback")
                .timestamp(System.currentTimeMillis())
                .build();
    }

    private String callGemini(String userMessage) throws Exception {
        String systemContext = AI_SYSTEM_PROMPT;

        String body = String.format("""
                {
                  "contents": [
                    {
                      "role": "user",
                      "parts": [{"text": "%s\\n\\nUser question: %s"}]
                    }
                  ],
                  "generationConfig": {
                    "temperature": 0.7,
                    "maxOutputTokens": 512
                  }
                }
                """, systemContext.replace("\"", "\\\""), userMessage.replace("\"", "\\\""));

        RequestBody requestBody = RequestBody.create(body, MediaType.parse("application/json"));
        Request request = new Request.Builder()
                .url(GEMINI_URL + geminiApiKey)
                .post(requestBody)
                .addHeader("Content-Type", "application/json")
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new RuntimeException("Gemini API returned: " + response.code());
            }
            String responseBody = response.body().string();
            JsonNode root = objectMapper.readTree(responseBody);
            return root.path("candidates").get(0)
                    .path("content").path("parts").get(0)
                    .path("text").asText("I couldn't generate a response.");
        }
    }

    private String getPosSmartreply(String message) {
        String m = message.toLowerCase(Locale.ROOT);

        if (m.contains("hello") || m.contains("hi") || m.contains("hey")) {
            return "Hello! I'm your POS AI Assistant. I can help you with inventory, sales reports, product management, orders, and customer insights. What would you like to know?";
        }
        if (m.contains("inventory") || m.contains("stock") || m.contains("low stock")) {
            return "📦 To check inventory: Go to **Products → Inventory** in the menu. You can view low-stock alerts, set reorder levels, and track stock across branches. Tip: Set up minimum stock alerts to get notified before running out.";
        }
        if (m.contains("sales") || m.contains("revenue") || m.contains("report")) {
            return "📊 Sales reports are available in the **Dashboard** and **Reports** section. You can view daily, weekly, and monthly sales trends. Filter by product, branch, or cashier for detailed insights.";
        }
        if (m.contains("product") || m.contains("item") || m.contains("price")) {
            return "🛍️ Manage products from **Products** in the sidebar. You can add/edit items, set prices, assign to categories, manage variants, and track stock levels. Use bulk import for adding many products at once.";
        }
        if (m.contains("order") || m.contains("transaction") || m.contains("purchase")) {
            return "🧾 Orders and transactions are tracked under the **Orders** section. You can view order history, process refunds, print receipts, and filter by date range or customer.";
        }
        if (m.contains("customer") || m.contains("client")) {
            return "👥 Customer management is in the **Customers** section. Track purchase history, contact info, and spending patterns to identify your top customers and build loyalty.";
        }
        if (m.contains("discount") || m.contains("coupon") || m.contains("promo")) {
            return "🏷️ Set up discounts in **Products → Pricing** or at point of sale. You can create percentage or fixed discounts, set expiry dates, and apply them to specific products or categories.";
        }
        if (m.contains("branch") || m.contains("store") || m.contains("location")) {
            return "🏪 Branch management is available under **Branches** in the admin panel. You can manage staff, inventory, and sales per branch separately and compare performance across locations.";
        }
        if (m.contains("staff") || m.contains("employee") || m.contains("cashier")) {
            return "👤 Staff management is in the **Users** section. Add cashiers and managers, assign them to branches, set roles and permissions, and monitor their activity and sales performance.";
        }
        if (m.contains("payment") || m.contains("cashfree") || m.contains("online payment")) {
            return "💳 This POS supports multiple payment methods including cash and online payments via Cashfree. Payment records are automatically saved with each transaction.";
        }
        if (m.contains("refund") || m.contains("return")) {
            return "↩️ Process refunds from **Orders → Order Details**. Select the items to return, confirm the refund amount, and the inventory will be automatically updated.";
        }
        if (m.contains("help") || m.contains("what can you do") || m.contains("features")) {
            return "I can help you with:\n• 📦 Inventory & stock management\n• 📊 Sales reports & analytics\n• 🛍️ Product management\n• 🧾 Orders & transactions\n• 👥 Customer management\n• 👤 Staff & branch management\n• 💳 Payment processing\n\nWhat would you like to know more about?";
        }
        if (m.contains("tip") || m.contains("advice") || m.contains("suggest")) {
            return "💡 Pro tip: Review your **top-selling products** weekly and ensure they're always in stock. Also, check the **sales by hour** report to optimize staffing during peak hours.";
        }

        return "I'm your POS AI Assistant! I can help with inventory management, sales reports, product setup, orders, customers, and more. Could you be more specific about what you need help with?";
    }

    @Override
    public List<InventoryWarningDTO> getInventoryWarnings(Long storeAdminId) {
        List<InventoryWarningDTO> warnings = new ArrayList<>();
        warnings.add(InventoryWarningDTO.builder()
                .productId(1L)
                .productName("Sample Product")
                .sku("SKU-001")
                .currentQty(5)
                .warningLevel("CRITICAL")
                .message("Stock is running very low. Please reorder soon.")
                .branchName("Main Branch")
                .build());
        return warnings;
    }

    @Override
    public List<ProductRecommendationDTO> getProductRecommendations(Long storeAdminId) {
        List<ProductRecommendationDTO> recommendations = new ArrayList<>();
        recommendations.add(ProductRecommendationDTO.builder()
                .productId(10L)
                .name("Recommended Product")
                .sku("REC-010")
                .sellingPrice(499.0)
                .category("Electronics")
                .reason("Frequently bought with recent purchases")
                .score(0.95)
                .build());
        return recommendations;
    }

    @Override
    public List<SalesPredictionDTO> getSalesPredictions(Long storeAdminId) {
        List<SalesPredictionDTO> predictions = new ArrayList<>();
        predictions.add(SalesPredictionDTO.builder()
                .date("2024-03-22")
                .actualSales(null)
                .predictedSales(15000.0)
                .isFuture(true)
                .build());
        return predictions;
    }
}
