package com.zosh.ai.payload;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductRecommendationDTO {
    private Long productId;
    private String name;
    private String sku;
    private Double sellingPrice;
    private String category;
    private String reason;
    private Double score; // co-purchase frequency score
    private String image;
}
