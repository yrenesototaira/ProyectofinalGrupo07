package com.marakosgrill.reservation.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ScheduleAvailabilityResponse {
    private String time;
    private String shift;
    private boolean available;
    private List<TableAvailabilityResponse> tables;
}
