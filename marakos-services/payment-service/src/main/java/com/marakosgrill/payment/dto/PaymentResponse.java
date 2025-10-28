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
    private Integer transactionId;
    private Integer reservationId;
    private LocalDateTime paymentDate;
    private String paymentMethod;
    private BigDecimal amount;
    private String status;
    private String externalTransactionId;
}

