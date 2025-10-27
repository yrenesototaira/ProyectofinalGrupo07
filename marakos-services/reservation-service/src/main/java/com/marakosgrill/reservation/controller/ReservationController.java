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

    @GetMapping("/date/{date}")
    public ResponseEntity<List<ReservationResponse>> getReservationsByDate(@PathVariable LocalDate date) {
        return ResponseEntity.ok(reservationService.findReservationsByDate(date));
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

    @PutMapping("/{id}")
    public ResponseEntity<ReservationResponse> updateReservation(@PathVariable Integer id,
                                                                 @Valid @RequestBody ReservationRequest request) {
        return ResponseEntity.ok(reservationService.updateReservation(id, request));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ReservationResponse> cancelReservation(@PathVariable Integer id) {
        return ResponseEntity.ok(reservationService.cancelReservation(id));
    }
}
