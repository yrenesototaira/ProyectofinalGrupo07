package com.marakosgrill.payment.controller;

import com.marakosgrill.payment.dto.PaymentRequest;
import com.marakosgrill.payment.dto.PaymentResponse;
import com.marakosgrill.payment.service.CulqiService;
import com.marakosgrill.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
@Validated
@Slf4j
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:3000"})
public class PaymentController {

    @Autowired
    private PaymentService paymentService;
    
    @Autowired
    private CulqiService culqiService;

    @PostMapping("/send")
    public ResponseEntity<PaymentResponse> processPayment(@RequestBody PaymentRequest request) {
        return ResponseEntity.ok(paymentService.processPayment(request));
    }
    
    @PostMapping("/culqi")
    public Mono<ResponseEntity<PaymentResponse>> processPaymentWithCulqi(@Valid @RequestBody PaymentRequest paymentRequest) {
        log.info("Received Culqi payment request for reservation: {}", paymentRequest.getReservationId());
        
        return culqiService.processPayment(paymentRequest)
                .map(response -> {
                    if ("COMPLETED".equals(response.getStatus())) {
                        log.info("Payment processed successfully: {}", response.getCulqiChargeId());
                        return ResponseEntity.ok(response);
                    } else {
                        log.warn("Payment failed for reservation: {}", paymentRequest.getReservationId());
                        return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED).body(response);
                    }
                })
                .onErrorResume(error -> {
                    log.error("Error processing payment: {}", error.getMessage());
                    PaymentResponse errorResponse = PaymentResponse.builder()
                            .reservationId(paymentRequest.getReservationId())
                            .status("ERROR")
                            .errorMessage("Error interno del servidor")
                            .build();
                    return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse));
                });
    }
    
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Payment Service is running");
    }
}
