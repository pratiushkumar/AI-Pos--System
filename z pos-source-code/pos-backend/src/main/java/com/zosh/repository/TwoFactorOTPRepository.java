package com.zosh.repository;

import com.zosh.modal.TwoFactorOTP;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TwoFactorOTPRepository extends JpaRepository<TwoFactorOTP, String> {
    Optional<TwoFactorOTP> findByUserId(Long userId);
}
