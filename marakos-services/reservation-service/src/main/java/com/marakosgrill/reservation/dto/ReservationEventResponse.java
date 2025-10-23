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
public class ReservationEventResponse {
    private Integer id;
    private Integer serviceId;
    private Integer quantity;
    private BigDecimal subtotal;
    private String observation;
}

