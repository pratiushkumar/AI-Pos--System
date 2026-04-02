package com.zosh.repository;

import com.zosh.modal.Payout;
import com.zosh.domain.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PayoutRepository extends JpaRepository<Payout, Long> {
    List<Payout> findByStoreId(Long storeId);
    List<Payout> findByStatus(PaymentStatus status);
    Optional<Payout> findByTransferId(String transferId);
    Optional<Payout> findByProviderTransactionId(String providerTransactionId);
}
