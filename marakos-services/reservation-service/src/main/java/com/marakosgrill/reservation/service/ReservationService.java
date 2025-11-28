package com.marakosgrill.reservation.service;

import com.marakosgrill.reservation.dto.ReservationRequest;
import com.marakosgrill.reservation.dto.ReservationResponse;
import com.marakosgrill.reservation.dto.ScheduleAvailabilityResponse;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface ReservationService {
    ReservationResponse createReservation(ReservationRequest request);
    ReservationResponse getReservationById(Integer id);
    List<ReservationResponse> findReservationsByCustomer(Integer customerId);
    List<ReservationResponse> findReservationsByDateAndStatus(LocalDate date, String status);
    boolean isTableAvailable(Integer tableId, LocalDate date, LocalTime time);
    boolean isEventAvailable(Integer eventTypeId, LocalDate date, String shift);
    ReservationResponse updateReservation(Integer id, ReservationRequest request);
    ReservationResponse cancelReservation(Integer id);
    // Consulta la disponibilidad de horarios y mesas para una fecha específica
    List<ScheduleAvailabilityResponse> getScheduleAvailability(LocalDate date);
    ReservationResponse checkinReservation(Integer id);
    ReservationResponse checkoutReservation(Integer id);
    ReservationResponse paidReservation(Integer id);
}
