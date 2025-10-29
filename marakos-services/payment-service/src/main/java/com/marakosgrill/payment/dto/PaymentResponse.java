package com.marakosgrill.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponse {
    // Existing fields for compatibility
    private Long transactionId;
    private Long reservationId;
    private LocalDateTime paymentDate;
    private String paymentMethod;
    private BigDecimal amount;
    private String status;
    private String externalTransactionId;
    
    // Additional fields for Culqi integration
    private String culqiChargeId;
    private String currency;
    private String customerEmail;
    private String description;
    private LocalDateTime processedAt;
    private String referenceCode;
    private String errorMessage;
    private String cardLastFour;
}

