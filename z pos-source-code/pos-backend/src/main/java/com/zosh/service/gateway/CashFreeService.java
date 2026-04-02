package com.zosh.service.gateway;

import com.cashfree.Cashfree;
import com.cashfree.model.*;
import com.cashfree.ApiResponse;
import com.zosh.exception.PaymentException;
import com.zosh.modal.Payment;
import com.zosh.modal.User;
import com.zosh.payload.response.PaymentLinkResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

/**
 * Service for Cashfree payment gateway integration
 */
@Service
@Slf4j
public class CashFreeService {

    // Supports BOTH id and key (fallback logic)
    @Value("${cashfree.api.id:}")
    private String appId;

    @Value("${cashfree.api.key:}")
    private String apiKeyFallback;

    @Value("${cashfree.api.secret:}")
    private String secretKey;

    @Value("${cashfree.api.env:SANDBOX}")
    private String env;

    private Cashfree getClient() {
        String finalAppId = (appId != null && !appId.isEmpty()) ? appId : apiKeyFallback;

        if (finalAppId == null || finalAppId.isEmpty() || secretKey == null || secretKey.isEmpty()) {
            throw new RuntimeException("Cashfree API credentials are missing. Check application.yml");
        }

        Cashfree.XClientId = finalAppId;
        Cashfree.XClientSecret = secretKey;
        Cashfree.XApiVersion = "2023-08-01";
        Cashfree.XEnvironment = env.equalsIgnoreCase("PRODUCTION")
                ? Cashfree.PRODUCTION
                : Cashfree.SANDBOX;

        return new Cashfree();
    }

    /**
     * Create a Cashfree order
     */
    public PaymentLinkResponse createOrder(User user, Payment payment) throws PaymentException {
        try {
            Cashfree client = getClient();

            CustomerDetails customerDetails = new CustomerDetails();
            customerDetails.setCustomerId("USER_" + user.getId());
            customerDetails.setCustomerEmail(user.getEmail());
            customerDetails.setCustomerPhone(
                    user.getPhone() != null ? user.getPhone() : "9999999999");
            customerDetails.setCustomerName(user.getFullName());

            CreateOrderRequest request = new CreateOrderRequest();
            request.setOrderAmount(BigDecimal.valueOf(payment.getAmount()));
            request.setOrderCurrency("INR");
            request.setOrderId(payment.getTransactionId());
            request.setCustomerDetails(customerDetails);

            ApiResponse<OrderEntity> response = client.PGCreateOrder(Cashfree.XApiVersion, request, null, null, null);

            OrderEntity order = response.getData();

            PaymentLinkResponse paymentLinkResponse = new PaymentLinkResponse();
            paymentLinkResponse.setPayment_link_id(order.getOrderId());

            // NOTE: This is session ID (not direct URL)
            paymentLinkResponse.setPayment_link_url(order.getPaymentSessionId());

            log.info("Cashfree order created successfully. Order ID: {}, Transaction ID: {}",
                    order.getOrderId(), payment.getTransactionId());

            return paymentLinkResponse;

        } catch (Exception e) {
            log.error("Failed to create Cashfree order: {}", e.getMessage(), e);
            throw new PaymentException("Failed to create Cashfree order: " + e.getMessage());
        }
    }

    /**
     * Verify payment status
     */
    public boolean verifyPayment(String orderId) throws PaymentException {
        try {
            Cashfree client = getClient();

            ApiResponse<OrderEntity> response = client.PGFetchOrder(orderId, Cashfree.XApiVersion, null, null, null);

            OrderEntity order = response.getData();

            String status = order.getOrderStatus();
            log.info("Cashfree order status for {}: {}", orderId, status);

            return "PAID".equalsIgnoreCase(status);

        } catch (Exception e) {
            log.error("Failed to verify Cashfree payment: {}", orderId, e);
            throw new PaymentException("Failed to verify Cashfree payment: " + e.getMessage());
        }
    }

    /**
     * Check if configured
     */
    public boolean isConfigured() {
        String finalAppId = (appId != null && !appId.isEmpty()) ? appId : apiKeyFallback;
        return finalAppId != null && !finalAppId.isEmpty()
                && secretKey != null && !secretKey.isEmpty();
    }
}