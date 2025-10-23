package com.marakosgrill.reservation.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationProductResponse {
    private Integer id;
    private Integer productId;
    private Integer quantity;
    private BigDecimal subtotal;
    private String observation;
}

