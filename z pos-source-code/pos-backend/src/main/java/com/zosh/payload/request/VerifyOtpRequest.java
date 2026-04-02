package com.zosh.payload.request;

import lombok.Data;

@Data
public class VerifyOtpRequest {
    private String email;
    private String otp;
    private String id; // the ID of the TwoFactorOTP we created earlier
}
