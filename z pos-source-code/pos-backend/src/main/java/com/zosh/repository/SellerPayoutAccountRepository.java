package com.zosh.repository;

import com.zosh.modal.SellerPayoutAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SellerPayoutAccountRepository extends JpaRepository<SellerPayoutAccount, Long> {
    Optional<SellerPayoutAccount> findByStoreId(Long storeId);
}
