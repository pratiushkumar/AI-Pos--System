package com.zosh.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zosh.domain.PaymentGateway;
import com.zosh.domain.PaymentStatus;
import com.zosh.modal.*;
import com.zosh.repository.*;
import com.zosh.service.PayoutService;
import com.zosh.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class PayoutServiceImpl implements PayoutService {

    private final PayoutRepository payoutRepository;
    private final StoreRepository storeRepository;
    private final SellerPayoutAccountRepository sellerAccountRepository;
    private final ReconciliationLogRepository reconciliationLogRepository;
    private final UserService userService;
    private final OkHttpClient httpClient;
    private final ObjectMapper objectMapper;

    @Value("${cashfree.api.id:}")
    private String appId; // From application.yml

    @Value("${cashfree.api.key:}")
    private String apiKey; // From application.yml

    @Value("${cashfree.api.secret:}")
    private String apiSecret; // From application.yml

    @Value("${cashfree.api.env:SANDBOX}")
    private String env;

    private static final String SANDBOX_PAYOUT_URL = "https://payout-api.cashfree.com/payout/v1.2";
    private static final String PRODUCTION_PAYOUT_URL = "https://payout-api.cashfree.com/payout/v1.2"; // Needs actual prod URL if different

    private String getBaseUrl() {
        return env.equalsIgnoreCase("PRODUCTION") ? PRODUCTION_PAYOUT_URL : SANDBOX_PAYOUT_URL;
    }

    /**
     * Auth to Cashfree Payout API to get Bearer token
     */
    private String getAuthToken() throws IOException {
        String url = getBaseUrl() + "/authorize";
        
        // Note: Cashfree Payouts uses X-Client-Id and X-Client-Secret headers
        Request request = new Request.Builder()
                .url(url)
                .post(RequestBody.create("", MediaType.parse("application/json")))
                .addHeader("X-Client-Id", appId != null && !appId.isEmpty() ? appId : apiKey)
                .addHeader("X-Client-Secret", apiSecret)
                .build();

        try (Response response = httpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new IOException("Failed to authorize with Cashfree Payouts: " + response.message());
            }
            JsonNode body = objectMapper.readTree(response.body().string());
            if ("SUCCESS".equals(body.get("status").asText())) {
                return body.get("data").get("token").asText();
            }
            throw new IOException("Cashfree Auth Error: " + body.get("message").asText());
        }
    }

    @Override
    @Transactional
    public Payout requestPayout(Long storeId, Double amount) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("Store not found"));

        Payout payout = Payout.builder()
                .store(store)
                .amount(amount)
                .status(PaymentStatus.PENDING)
                .provider(PaymentGateway.CASHFREE)
                .requestedAt(LocalDateTime.now())
                .transferId("PAYOUT_" + UUID.randomUUID().toString())
                .currency("INR")
                .build();

        return payoutRepository.save(payout);
    }

    @Override
    @Transactional
    public Payout processPayout(Long payoutId) {
        Payout payout = payoutRepository.findById(payoutId)
                .orElseThrow(() -> new RuntimeException("Payout request not found"));

        if (payout.getStatus() == PaymentStatus.SUCCESS) {
            throw new RuntimeException("Payout already processed");
        }

        SellerPayoutAccount sellerAccount = sellerAccountRepository.findByStoreId(payout.getStore().getId())
                .orElseThrow(() -> new RuntimeException("SellerPayoutAccount not linked for store"));

        try {
            String token = getAuthToken();
            String url = getBaseUrl() + "/requestTransfer";

            Map<String, Object> payload = new HashMap<>();
            payload.put("beneId", sellerAccount.getBeneficiaryId());
            payload.put("amount", payout.getAmount());
            payload.put("transferId", payout.getTransferId());
            payload.put("transferMode", "banktransfer");

            Request request = new Request.Builder()
                    .url(url)
                    .post(RequestBody.create(objectMapper.writeValueAsString(payload), MediaType.parse("application/json")))
                    .addHeader("Authorization", "Bearer " + token)
                    .build();

            try (Response response = httpClient.newCall(request).execute()) {
                JsonNode body = objectMapper.readTree(response.body().string());
                
                if (response.isSuccessful() && "SUCCESS".equals(body.get("status").asText())) {
                    payout.setStatus(PaymentStatus.SUCCESS);
                    payout.setProviderTransactionId(body.get("data").get("referenceId").asText());
                    payout.setCompletedAt(LocalDateTime.now());
                    log.info("Payout successful for ID {}: Reference {}", payoutId, payout.getProviderTransactionId());
                } else {
                    payout.setStatus(PaymentStatus.FAILED);
                    payout.setFailureReason(body.get("message").asText());
                    log.error("Payout failed for ID {}: {}", payoutId, payout.getFailureReason());
                }
                return payoutRepository.save(payout);
            }
        } catch (Exception e) {
            log.error("Exception during payout process: {}", e.getMessage());
            payout.setStatus(PaymentStatus.FAILED);
            payout.setFailureReason("System error: " + e.getMessage());
            return payoutRepository.save(payout);
        }
    }

    @Override
    public Payout verifyPayoutStatus(Long payoutId) {
        Payout payout = payoutRepository.findById(payoutId)
                .orElseThrow(() -> new RuntimeException("Payout not found"));

        try {
            String token = getAuthToken();
            String url = getBaseUrl() + "/getTransferStatus?transferId=" + payout.getTransferId();

            Request request = new Request.Builder()
                    .url(url)
                    .get()
                    .addHeader("Authorization", "Bearer " + token)
                    .build();

            try (Response response = httpClient.newCall(request).execute()) {
                JsonNode body = objectMapper.readTree(response.body().string());
                if (response.isSuccessful() && "SUCCESS".equals(body.get("status").asText())) {
                    String providerStatus = body.get("data").get("transfer").get("status").asText();
                    
                    // Non-functional requirement: Reconciliation between Internal and External
                    reconcileWithProvider(payoutId);
                    
                    if ("SUCCESS".equalsIgnoreCase(providerStatus)) {
                        payout.setStatus(PaymentStatus.SUCCESS);
                        payout.setCompletedAt(LocalDateTime.now());
                    } else if ("FAILED".equalsIgnoreCase(providerStatus)) {
                        payout.setStatus(PaymentStatus.FAILED);
                    }
                    return payoutRepository.save(payout);
                }
            }
        } catch (Exception e) {
            log.error("Status verification failed for payout {}: {}", payoutId, e.getMessage());
        }
        return payout;
    }

    @Override
    public void reconcileWithProvider(Long payoutId) {
        Payout payout = payoutRepository.findById(payoutId).orElse(null);
        if (payout == null) return;

        try {
            String token = getAuthToken();
            String url = getBaseUrl() + "/getTransferStatus?transferId=" + payout.getTransferId();

            Request request = new Request.Builder().url(url).get()
                    .addHeader("Authorization", "Bearer " + token).build();

            try (Response response = httpClient.newCall(request).execute()) {
                JsonNode body = objectMapper.readTree(response.body().string());
                
                ReconciliationLog logEntry = ReconciliationLog.builder()
                        .entityType("PAYOUT")
                        .entityId(payoutId)
                        .providerReferenceId(payout.getTransferId())
                        .internalStatus(payout.getStatus().toString())
                        .internalAmount(payout.getAmount())
                        .build();

                if (response.isSuccessful() && "SUCCESS".equals(body.get("status").asText())) {
                    JsonNode transferData = body.get("data").get("transfer");
                    String pStatus = transferData.get("status").asText();
                    Double pAmount = transferData.get("amount").asDouble();
                    
                    logEntry.setProviderStatus(pStatus);
                    logEntry.setProviderAmount(pAmount);
                    logEntry.setMatch(payout.getStatus().toString().equalsIgnoreCase(pStatus));
                    logEntry.setAmountMatch(Math.abs(payout.getAmount() - pAmount) < 0.01);
                } else {
                    logEntry.setMatch(false);
                    logEntry.setNotes("Provider record not found or error: " + response.message());
                }
                reconciliationLogRepository.save(logEntry);
            }
        } catch (Exception e) {
            log.error("Reconciliation error for payout {}: {}", payoutId, e.getMessage());
        }
    }

    @Override
    public void handlePayoutWebhook(String payload) {
        // Implementation for async webhook handling
        log.info("Received payout webhook: {}", payload);
    }

    @Override
    public List<Payout> getPayoutsByStore(Long storeId) {
        return payoutRepository.findByStoreId(storeId);
    }

    @Override
    @Transactional
    public SellerPayoutAccount linkSellerAccount(Long storeId, SellerPayoutAccount account) {
        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new RuntimeException("Store not found"));
        account.setStore(store);
        return sellerAccountRepository.save(account);
    }

    @Override
    public SellerPayoutAccount getSellerAccount(Long storeId) {
        return sellerAccountRepository.findByStoreId(storeId).orElse(null);
    }
}
