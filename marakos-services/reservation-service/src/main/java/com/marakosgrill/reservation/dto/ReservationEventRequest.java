package com.marakosgrill.reservation.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationEventRequest {
    @NotNull
    private Integer serviceId;
    @NotNull
    @Min(1)
    private Integer quantity;
    @NotNull
    @DecimalMin("0.00")
    private BigDecimal subtotal;
    private String observation;
}

