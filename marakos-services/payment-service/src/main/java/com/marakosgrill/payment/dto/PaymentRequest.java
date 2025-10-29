package com.marakosgrill.payment.dto;

import jakarta.validation.constraints.*;
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
    // Existing fields for compatibility
    private Long transactionId;
    @NotNull
    private Long reservationId;
    private LocalDateTime paymentDate;
    @NotBlank
    private String paymentMethod;
    @NotNull
    @DecimalMin("0.00")
    private BigDecimal amount;
    private Integer createdBy;
    
    // New fields for Culqi integration
    @NotBlank
    @Email
    private String customerEmail;
    
    @NotBlank
    private String customerName;
    
    @NotBlank
    private String customerPhone;
    
    // Card details for Culqi token creation
    @Pattern(regexp = "\\d{16}", message = "Card number must be 16 digits")
    private String cardNumber;
    
    @Pattern(regexp = "\\d{3,4}", message = "CVV must be 3 or 4 digits")
    private String cvv;
    
    @Pattern(regexp = "(0[1-9]|1[0-2])", message = "Month must be 01-12")
    private String expirationMonth;
    
    @Pattern(regexp = "\\d{4}", message = "Year must be 4 digits")
    private String expirationYear;
    
    private String description;
}


