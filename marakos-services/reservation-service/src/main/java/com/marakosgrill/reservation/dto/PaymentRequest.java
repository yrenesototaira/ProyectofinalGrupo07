package com.marakosgrill.reservation.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentRequest {
    @NotNull
    private LocalDateTime paymentDate;
    @NotBlank
    private String paymentMethod;
    @NotNull
    @DecimalMin("0.00")
    private BigDecimal amount;
    @NotBlank
    private String status;
    private String externalTransactionId;
    @NotNull
    private Integer createdBy;
}


