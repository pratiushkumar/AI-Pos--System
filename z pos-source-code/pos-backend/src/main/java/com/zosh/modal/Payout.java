package com.zosh.modal;

import com.zosh.domain.PaymentGateway;
import com.zosh.domain.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Model representing a payout from platform to seller
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payout {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    private Double amount;
    
    private String currency;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status; // PENDING, SUCCESS, FAILED, PROCESSING

    private PaymentGateway provider; // CASHFREE

    // External Reference IDs
    private String transferId; // Platforms' internal transfer id
    private String providerTransactionId; // referenceId from PSP
    private String utr; // Unique Transaction Reference from Bank

    private String failureReason;

    private LocalDateTime requestedAt;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = updatedAt = requestedAt = LocalDateTime.now();
        if (status == null) status = PaymentStatus.PENDING;
        if (currency == null) currency = "INR";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
