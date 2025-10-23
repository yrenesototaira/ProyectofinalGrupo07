package com.marakosgrill.reservation.service;

import com.marakosgrill.reservation.dto.ReservationRequest;
import com.marakosgrill.reservation.dto.ReservationResponse;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface ReservationService {
    ReservationResponse createReservation(ReservationRequest request);
    List<ReservationResponse> findReservationsByCustomer(Integer customerId);
    List<ReservationResponse> findReservationsByDate(LocalDate date);
    boolean isTableAvailable(Integer tableId, LocalDate date, LocalTime time);
    boolean isEventAvailable(Integer eventTypeId, LocalDate date, String shift);
    ReservationResponse updateReservation(Integer id, ReservationRequest request);
    ReservationResponse cancelReservation(Integer id);
}
