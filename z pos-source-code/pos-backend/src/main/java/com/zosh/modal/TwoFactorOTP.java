package com.zosh.modal;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import lombok.Data;

@Entity
@Data
public class TwoFactorOTP {
    @Id
    private String id;
    
    private String otp;
    
    @OneToOne
    private User user;
    
    // Using String to store JWT token to be issued upon OTP verification
    private String jwt;
}
