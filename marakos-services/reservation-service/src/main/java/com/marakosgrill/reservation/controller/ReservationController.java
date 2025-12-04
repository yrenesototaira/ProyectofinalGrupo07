package com.marakosgrill.reservation.controller;

import com.marakosgrill.reservation.dto.*;
import com.marakosgrill.reservation.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/reservation")
@RequiredArgsConstructor
@Validated
public class ReservationController {
    private final ReservationService reservationService;

    @PostMapping
    public ResponseEntity<ReservationResponse> createReservation(@Valid @RequestBody ReservationRequest request) {
        return ResponseEntity.ok(reservationService.createReservation(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReservationResponse> getReservationById(@PathVariable Integer id) {
        return ResponseEntity.ok(reservationService.getReservationById(id));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<ReservationResponse>> getReservationsByCustomer(@PathVariable Integer customerId) {
        return ResponseEntity.ok(reservationService.findReservationsByCustomer(customerId));
    }

    @GetMapping("/date/{date}/status/{status}")
    public ResponseEntity<List<ReservationResponse>> getReservationsByDateAndStatus(@PathVariable LocalDate date,
                                                                                    @PathVariable String status) {
        return ResponseEntity.ok(reservationService.findReservationsByDateAndStatus(date, status));
    }

    @GetMapping("/table-availability")
    public ResponseEntity<Boolean> isTableAvailable(@RequestParam Integer tableId,
                                                   @RequestParam LocalDate date,
                                                   @RequestParam LocalTime time) {
        return ResponseEntity.ok(reservationService.isTableAvailable(tableId, date, time));
    }

    @GetMapping("/event-availability")
    public ResponseEntity<Boolean> isEventAvailable(@RequestParam Integer eventTypeId,
                                                   @RequestParam LocalDate date,
                                                   @RequestParam String shift) {
        return ResponseEntity.ok(reservationService.isEventAvailable(eventTypeId, date, shift));
    }

    @GetMapping("/availability")
    public ResponseEntity<List<ScheduleAvailabilityResponse>> getScheduleAvailability(@RequestParam LocalDate date) {
        return ResponseEntity.ok(reservationService.getScheduleAvailability(date));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReservationResponse> updateReservation(@PathVariable Integer id,
                                                                 @Valid @RequestBody ReservationRequest request) {
        return ResponseEntity.ok(reservationService.updateReservation(id, request));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ReservationResponse> cancelReservation(@PathVariable Integer id) {
        return ResponseEntity.ok(reservationService.cancelReservation(id));
    }

    @PatchMapping("/{id}/checkin")
    public ResponseEntity<ReservationResponse> checkinReservation(@PathVariable Integer id) {
        return ResponseEntity.ok(reservationService.checkinReservation(id));
    }

    @PatchMapping("/{id}/checkout")
    public ResponseEntity<ReservationResponse> checkoutReservation(@PathVariable Integer id) {
        return ResponseEntity.ok(reservationService.checkoutReservation(id));
    }

    @PatchMapping("/{id}/paid")
    public ResponseEntity<ReservationResponse> paidReservation(@PathVariable Integer id) {
        return ResponseEntity.ok(reservationService.paidReservation(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ReservationResponse> updateReservationStatus(@PathVariable Integer id, 
                                                                        @RequestBody UpdateStatusRequest request) {
        return ResponseEntity.ok(reservationService.updateReservationStatus(id, request.getStatus()));
    }

    @GetMapping("/event-shifts/availability")
    public ResponseEntity<EventShiftAvailabilityResponse> getEventShiftAvailability(@RequestParam LocalDate date) {
        return ResponseEntity.ok(reservationService.getEventShiftAvailability(date));
    }
}
