package com.marakosgrill.payment.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class PaymentRequest {
    @NotNull
    private Integer transactionId;
    @NotNull
    private Integer reservationId;
    @NotNull
    private LocalDateTime paymentDate;
    @NotBlank
    private String paymentMethod;
    @NotNull
    @DecimalMin("0.00")
    private BigDecimal amount;
    @NotNull
    private Integer createdBy;
}


