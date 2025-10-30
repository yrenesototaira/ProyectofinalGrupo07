package com.marakosgrill.reservation.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TableAvailabilityResponse {
    private int id;
    private String name;
    private boolean available;
}
