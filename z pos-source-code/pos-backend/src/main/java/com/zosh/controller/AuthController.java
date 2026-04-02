package com.zosh.controller;


import com.zosh.exception.UserException;
import com.zosh.payload.dto.UserDTO;
import com.zosh.payload.request.ForgotPasswordRequest;
import com.zosh.payload.request.LoginDto;
import com.zosh.payload.request.ResetPasswordRequest;
import com.zosh.payload.response.ApiResponse;
import com.zosh.payload.response.ApiResponseBody;
import com.zosh.payload.response.AuthResponse;
import com.zosh.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {


    private final AuthService authService;



    @PostMapping("/signup")
    public ResponseEntity<ApiResponseBody<AuthResponse>> signupHandler(
            @RequestBody @Valid UserDTO req) throws UserException {

        AuthResponse response=authService.signup(req);
        return ResponseEntity.ok(new ApiResponseBody<>(true,
                "User created successfully", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponseBody<AuthResponse>> loginHandler(
            @RequestBody LoginDto req) throws UserException {

        AuthResponse response=authService.login(req.getEmail(), req.getPassword());

        return ResponseEntity.ok(new ApiResponseBody<>(
                true,
                "User logged in successfully",
                response));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse> forgotPassword(
            @RequestBody ForgotPasswordRequest request
    ) throws UserException {

        authService.createPasswordResetToken(request.getEmail());

        ApiResponse res= new ApiResponse(
                "A Reset link was sent to your email."
        );
        return ResponseEntity.ok(res);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse> resetPassword(
            @RequestBody ResetPasswordRequest request) {
         authService.resetPassword(request.getToken(), request.getPassword());
        ApiResponse res= new ApiResponse(
                "Password reset successful"
        );
        return ResponseEntity.ok(res);
    }

    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse> sendOtp(@RequestBody com.zosh.payload.request.OtpLoginRequest request) throws Exception {
        String reqId = authService.sendOTP(request.getEmail());
        
        ApiResponse res = new ApiResponse("OTP sent to email. Verification ID: " + reqId);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponseBody<AuthResponse>> verifyOtp(@RequestBody com.zosh.payload.request.VerifyOtpRequest request) throws Exception {
        AuthResponse response = authService.verifyOTP(request.getId(), request.getOtp());
        
        return ResponseEntity.ok(new ApiResponseBody<>(true, "OTP Verified Successfully", response));
    }
}
