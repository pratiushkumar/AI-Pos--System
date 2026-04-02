package com.zosh.controller;

import com.zosh.service.PaymentService;
import com.zosh.exception.PaymentException;
import com.zosh.payload.dto.PaymentDTO;
import com.zosh.payload.request.PaymentInitiateRequest;
import com.zosh.payload.request.PaymentVerifyRequest;
import com.zosh.payload.response.PaymentInitiateResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/initiate")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PaymentInitiateResponse> initiatePayment(
            @RequestBody PaymentInitiateRequest request) throws PaymentException {
        
        PaymentInitiateResponse response = paymentService.initiatePayment(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PaymentDTO> verifyPayment(
            @RequestBody PaymentVerifyRequest request) throws PaymentException {
        
        PaymentDTO response = paymentService.verifyPayment(request);
        return ResponseEntity.ok(response);
    }

}
