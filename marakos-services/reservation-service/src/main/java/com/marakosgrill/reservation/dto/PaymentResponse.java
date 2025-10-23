package com.marakosgrill.reservation.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponse {
    private Integer id;
    private LocalDateTime paymentDate;
    private String paymentMethod;
    private BigDecimal amount;
    private String status;
    private String externalTransactionId;
    private Integer createdBy;
}

