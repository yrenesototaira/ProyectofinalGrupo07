package com.marakosgrill.reservation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventShiftAvailabilityResponse {
    private List<Integer> availableShifts;
    private List<Integer> occupiedShifts;
}
