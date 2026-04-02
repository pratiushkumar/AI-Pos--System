package com.zosh.modal;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Model representing a reconciliation log entry between internal and external records
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReconciliationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String entityType; // PAYMENT, PAYOUT, ORDER
    private Long entityId; // Internal ID

    private String providerReferenceId; // External ID (Transaction ID, Order ID)

    private String internalStatus;
    private String providerStatus;

    private boolean isMatch; // Status matches?
    private boolean isAmountMatch; // Amount matches?

    private Double internalAmount;
    private Double providerAmount;

    private LocalDateTime reconciliationTime;
    private String resolutionAction; // MANUAL_OVERRIDE, AUTOMATIC_SYNC
    private String notes;

    @PrePersist
    protected void onCreate() {
        reconciliationTime = LocalDateTime.now();
    }
}
