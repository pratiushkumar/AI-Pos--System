package com.zosh.service;

import com.zosh.modal.Payout;
import com.zosh.modal.SellerPayoutAccount;
import com.zosh.payload.response.ApiResponse;
import java.util.List;

/**
 * Service for managing seller payouts and reconciliation
 */
public interface PayoutService {

    // Functional: Payout Flow
    Payout requestPayout(Long storeId, Double amount);
    Payout processPayout(Long payoutId);
    
    // Non-Functional: Reliability & Fault Tolerance
    Payout verifyPayoutStatus(Long payoutId);
    void handlePayoutWebhook(String payload);
    
    // Non-Functional: Reconciliation
    void reconcileWithProvider(Long payoutId);
    List<Payout> getPayoutsByStore(Long storeId);
    
    // Beneficiary Account Management
    SellerPayoutAccount linkSellerAccount(Long storeId, SellerPayoutAccount account);
    SellerPayoutAccount getSellerAccount(Long storeId);
}
