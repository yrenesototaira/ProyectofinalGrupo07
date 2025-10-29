package com.marakosgrill.payment.service;

import com.marakosgrill.payment.dto.*;
import com.marakosgrill.payment.entity.Payment;
import com.marakosgrill.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class CulqiService {
    
    @Qualifier("culqiWebClient")
    private final WebClient webClient;
    
    private final PaymentRepository paymentRepository;
    
    @Value("${culqi.public-key}")
    private String publicKey;
    
    @Value("${culqi.secret-key}")
    private String secretKey;
    
    /**
     * Step 1: Create a token for the card
     */
    public Mono<CulqiTokenResponse> createToken(CulqiTokenRequest tokenRequest) {
        log.info("Creating Culqi token for email: {}", tokenRequest.getEmail());
        
        return webClient.post()
                .uri("/v2/tokens")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + publicKey)
                .bodyValue(tokenRequest)
                .retrieve()
                .bodyToMono(CulqiTokenResponse.class)
                .doOnSuccess(response -> log.info("Token created successfully: {}", response.getId()))
                .doOnError(error -> log.error("Error creating token: {}", error.getMessage()));
    }
    
    /**
     * Step 2: Process the payment using the token
     */
    public Mono<CulqiChargeResponse> processCharge(CulqiChargeRequest chargeRequest) {
        log.info("Processing Culqi charge for amount: {} {}", chargeRequest.getAmount(), chargeRequest.getCurrencyCode());
        
        return webClient.post()
                .uri("/v2/charges")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + secretKey)
                .bodyValue(chargeRequest)
                .retrieve()
                .bodyToMono(CulqiChargeResponse.class)
                .doOnSuccess(response -> log.info("Charge processed successfully: {}", response.getId()))
                .doOnError(error -> log.error("Error processing charge: {}", error.getMessage()));
    }
    
    /**
     * Complete payment process: Create token and process charge
     */
    public Mono<PaymentResponse> processPayment(PaymentRequest paymentRequest) {
        log.info("Starting complete payment process for reservation: {}", paymentRequest.getReservationId());
        
        // Step 1: Create token request
        CulqiTokenRequest tokenRequest = CulqiTokenRequest.builder()
                .cardNumber(paymentRequest.getCardNumber())
                .cvv(paymentRequest.getCvv())
                .expirationMonth(paymentRequest.getExpirationMonth())
                .expirationYear(paymentRequest.getExpirationYear())
                .email(paymentRequest.getCustomerEmail())
                .build();
        
        return createToken(tokenRequest)
                .flatMap(tokenResponse -> {
                    // Step 2: Create charge request using the token
                    CulqiChargeRequest chargeRequest = CulqiChargeRequest.builder()
                            .amount(convertToIntCents(paymentRequest.getAmount()))
                            .currencyCode("PEN")
                            .sourceId(tokenResponse.getId())
                            .email(paymentRequest.getCustomerEmail())
                            .description("Reserva #" + paymentRequest.getReservationId())
                            .build();
                    
                    return processCharge(chargeRequest);
                })
                .map(chargeResponse -> mapToPaymentResponse(paymentRequest, chargeResponse))
                .doOnSuccess(response -> log.info("Payment completed successfully: {}", response.getCulqiChargeId()))
                .onErrorResume(error -> {
                    log.error("Error in payment process: {}", error.getMessage(), error);
                    return Mono.just(createErrorResponse(paymentRequest, error));
                });
    }
    
    private Integer convertToIntCents(BigDecimal amount) {
        return amount.multiply(BigDecimal.valueOf(100)).intValue();
    }
    
    private PaymentResponse mapToPaymentResponse(PaymentRequest request, CulqiChargeResponse chargeResponse) {
        // Save payment to database
        Payment payment = Payment.builder()
                .reservationId(request.getReservationId())
                .paymentDate(LocalDateTime.now())
                .paymentMethod("CULQI_CARD")
                .amount(request.getAmount())
                .status(Payment.PaymentStatus.COMPLETED)
                .culqiChargeId(chargeResponse.getId())
                .currency("PEN")
                .customerEmail(request.getCustomerEmail())
                .customerName(request.getCustomerName())
                .customerPhone(request.getCustomerPhone())
                .description("Reserva #" + request.getReservationId())
                .processedAt(LocalDateTime.now())
                .referenceCode(chargeResponse.getReferenceCode())
                .cardLastFour(chargeResponse.getSource() != null ? 
                    chargeResponse.getSource().getCardNumber() : null)
                .build();
        
        Payment savedPayment = paymentRepository.save(payment);
        log.info("Payment saved to database with ID: {}", savedPayment.getTransactionId());
        
        return PaymentResponse.builder()
                .transactionId(savedPayment.getTransactionId())
                .reservationId(request.getReservationId())
                .paymentMethod("CULQI_CARD")
                .amount(request.getAmount())
                .status("COMPLETED")
                .paymentDate(savedPayment.getPaymentDate())
                .processedAt(savedPayment.getProcessedAt())
                .culqiChargeId(chargeResponse.getId())
                .currency("PEN")
                .customerEmail(request.getCustomerEmail())
                .description("Reserva #" + request.getReservationId())
                .referenceCode(chargeResponse.getReferenceCode())
                .cardLastFour(chargeResponse.getSource() != null ? 
                    chargeResponse.getSource().getCardNumber() : null)
                .build();
    }
    
    private PaymentResponse createErrorResponse(PaymentRequest request, Throwable error) {
        String errorMessage = "Error procesando el pago con Culqi";
        if (error != null && error.getMessage() != null) {
            errorMessage = error.getMessage();
        }
        
        // Save failed payment to database
        Payment failedPayment = Payment.builder()
                .reservationId(request.getReservationId())
                .paymentDate(LocalDateTime.now())
                .paymentMethod("CULQI_CARD")
                .amount(request.getAmount())
                .status(Payment.PaymentStatus.FAILED)
                .currency("PEN")
                .customerEmail(request.getCustomerEmail())
                .customerName(request.getCustomerName())
                .customerPhone(request.getCustomerPhone())
                .description("Reserva #" + request.getReservationId())
                .processedAt(LocalDateTime.now())
                .errorMessage(errorMessage)
                .build();
        
        Payment savedPayment = paymentRepository.save(failedPayment);
        log.info("Failed payment saved to database with ID: {}", savedPayment.getTransactionId());
        
        return PaymentResponse.builder()
                .transactionId(savedPayment.getTransactionId())
                .reservationId(request.getReservationId())
                .paymentMethod("CULQI_CARD")
                .amount(request.getAmount())
                .status("FAILED")
                .paymentDate(savedPayment.getPaymentDate())
                .processedAt(savedPayment.getProcessedAt())
                .currency("PEN")
                .customerEmail(request.getCustomerEmail())
                .description("Reserva #" + request.getReservationId())
                .errorMessage(errorMessage)
                .build();
    }
    
    @SuppressWarnings("unused")
    private PaymentResponse createErrorResponse(PaymentRequest request) {
        return createErrorResponse(request, null);
    }
}