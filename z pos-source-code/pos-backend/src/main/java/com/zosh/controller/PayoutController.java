package com.zosh.controller;

import com.zosh.modal.Payout;
import com.zosh.modal.SellerPayoutAccount;
import com.zosh.payload.response.ApiResponse;
import com.zosh.service.PayoutService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payouts")
@RequiredArgsConstructor
public class PayoutController {

    private final PayoutService payoutService;

    @PostMapping("/request")
    @PreAuthorize("hasAuthority('ROLE_STORE_ADMIN')")
    public ResponseEntity<Payout> requestPayout(
            @RequestParam Long storeId,
            @RequestParam Double amount) {
        return ResponseEntity.ok(payoutService.requestPayout(storeId, amount));
    }

    @PostMapping("/{id}/process")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Payout> processPayout(@PathVariable Long id) {
        return ResponseEntity.ok(payoutService.processPayout(id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Payout> getPayoutStatus(@PathVariable Long id) {
        return ResponseEntity.ok(payoutService.verifyPayoutStatus(id));
    }

    @GetMapping("/store/{storeId}")
    public ResponseEntity<List<Payout>> getStorePayouts(@PathVariable Long storeId) {
        return ResponseEntity.ok(payoutService.getPayoutsByStore(storeId));
    }

    @PostMapping("/link-account")
    @PreAuthorize("hasAuthority('ROLE_STORE_ADMIN')")
    public ResponseEntity<SellerPayoutAccount> linkAccount(
            @RequestParam Long storeId,
            @RequestBody SellerPayoutAccount account) {
        return ResponseEntity.ok(payoutService.linkSellerAccount(storeId, account));
    }

    @GetMapping("/account/{storeId}")
    public ResponseEntity<SellerPayoutAccount> getAccount(@PathVariable Long storeId) {
        return ResponseEntity.ok(payoutService.getSellerAccount(storeId));
    }

}
