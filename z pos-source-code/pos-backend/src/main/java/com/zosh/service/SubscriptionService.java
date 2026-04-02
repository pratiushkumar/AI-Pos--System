package com.zosh.service;

import com.zosh.domain.PaymentGateway;
import com.zosh.domain.PaymentStatus;
import com.zosh.domain.SubscriptionStatus;
import com.zosh.exception.PaymentException;
import com.zosh.modal.Payment;
import com.zosh.modal.Store;
import com.zosh.modal.Subscription;
import com.zosh.modal.SubscriptionPlan;
import com.zosh.payload.response.PaymentInitiateResponse;

import java.util.List;
import java.util.Optional;

public interface SubscriptionService {

    // 🆕 Create a new subscription for a store
    PaymentInitiateResponse createSubscription(@org.springframework.lang.NonNull Long storeId,
                                               @org.springframework.lang.NonNull Long planId,
                                               PaymentGateway gateway,
                                               String transactionId
    ) throws PaymentException;

    // 🔄 Upgrade the current active subscription
    PaymentInitiateResponse upgradeSubscription(@org.springframework.lang.NonNull Long storeId,
                                     @org.springframework.lang.NonNull Long planId,
                                     PaymentGateway gateway, String transactionId) throws PaymentException;

    // ✅ Activate subscription (after payment success)
    Subscription activateSubscription(@org.springframework.lang.NonNull Long subscriptionId);

    // 🚫 Cancel a subscription manually
    Subscription cancelSubscription(@org.springframework.lang.NonNull Long subscriptionId);

    // ⏳ Expire subscriptions that passed end date
    void expirePastSubscriptions();

    // 🧾 Update payment status (after webhook or manual)
    Subscription updatePaymentStatus(@org.springframework.lang.NonNull Long subscriptionId, PaymentStatus status);

    // 📋 🔍 Get all or filtered subscriptions of a store (if status provided)
    List<Subscription> getSubscriptionsByStore(@org.springframework.lang.NonNull Long storeId, SubscriptionStatus status); // combine active + history

    // 📦 📍 Get all or filtered subscriptions (for admin)
    List<Subscription> getAllSubscriptions(SubscriptionStatus status); // null status = all

    // 📅 Get subscriptions expiring in next X days
    List<Subscription> getExpiringSubscriptionsWithin(int days);

    // 📈 Count subscriptions by status
    Long countByStatus(SubscriptionStatus status);
}
