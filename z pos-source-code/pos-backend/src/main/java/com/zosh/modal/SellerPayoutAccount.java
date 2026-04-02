package com.zosh.modal;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Model representing a seller's payout (bank) account
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SellerPayoutAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    // Cashfree Beneficiary Details
    private String beneficiaryId;
    private String beneficiaryName;
    private String beneficiaryEmail;
    private String beneficiaryPhone;

    // Bank Account Details
    private String bankAccountType; // SAVINGS or CURRENT
    private String accountNumber;
    private String ifscCode;
    
    // Virtual Account / UPI ID
    private String vpa;

    private boolean isVerified;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
