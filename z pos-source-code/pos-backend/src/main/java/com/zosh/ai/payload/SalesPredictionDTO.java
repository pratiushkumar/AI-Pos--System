package com.zosh.ai.payload;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesPredictionDTO {
    private String date;          // "2024-03-15"
    private Double actualSales;   // null for future dates
    private Double predictedSales;
    private boolean isFuture;
}
