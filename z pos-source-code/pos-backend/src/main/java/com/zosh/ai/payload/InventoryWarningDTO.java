package com.zosh.ai.payload;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryWarningDTO {
    private Long productId;
    private String productName;
    private String sku;
    private Integer currentQty;
    private String warningLevel; // "LOW" or "CRITICAL"
    private String message;
    private String branchName;
}
