package com.zosh.service;

import com.zosh.exception.UserException;
import com.zosh.payload.dto.UserDTO;
import com.zosh.payload.response.AuthResponse;

public interface AuthService {
    AuthResponse login(String username, String password) throws UserException;
    AuthResponse signup(UserDTO req) throws UserException;

    void createPasswordResetToken(String email) throws UserException;
    void resetPassword(String token, String newPassword);
    String sendOTP(String email) throws UserException;
    AuthResponse verifyOTP(String id, String otp) throws Exception;
}
