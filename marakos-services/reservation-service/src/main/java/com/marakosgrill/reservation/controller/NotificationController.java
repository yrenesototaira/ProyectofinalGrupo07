package com.marakosgrill.reservation.controller;

import com.marakosgrill.reservation.dto.NotificationRequest;
import com.marakosgrill.reservation.dto.NotificationResponse;
import com.marakosgrill.reservation.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/notification")
@RequiredArgsConstructor
@Validated
public class NotificationController {
    private final NotificationService notificationService;

    @PostMapping
    public ResponseEntity<NotificationResponse> createNotification(@Valid @RequestBody NotificationRequest request) {
        return ResponseEntity.ok(notificationService.createNotification(request));
    }

    @GetMapping("/reservation/{reservationId}")
    public ResponseEntity<List<NotificationResponse>> getNotificationsByReservation(@PathVariable Integer reservationId) {
        return ResponseEntity.ok(notificationService.getNotificationsByReservation(reservationId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<NotificationResponse> getNotificationById(@PathVariable Integer id) {
        return ResponseEntity.ok(notificationService.getNotificationById(id));
    }
}

