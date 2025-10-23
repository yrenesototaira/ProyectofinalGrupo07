package com.marakosgrill.reservation.service.impl;

import com.marakosgrill.reservation.dto.NotificationRequest;
import com.marakosgrill.reservation.dto.NotificationResponse;
import com.marakosgrill.reservation.model.Notification;
import com.marakosgrill.reservation.model.Reservation;
import com.marakosgrill.reservation.repository.NotificationRepository;
import com.marakosgrill.reservation.repository.ReservationRepository;
import com.marakosgrill.reservation.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {
    private final NotificationRepository notificationRepository;
    private final ReservationRepository reservationRepository;

    @Override
    @Transactional
    public NotificationResponse createNotification(NotificationRequest request) {
        Reservation reservation = reservationRepository.findById(request.getReservationId())
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
        Notification notification = Notification.builder()
                .reservation(reservation)
                .notificationType(request.getNotificationType())
                .channel(request.getChannel())
                .message(request.getMessage())
                .status(request.getStatus())
                .sentDate(request.getSentDate())
                .createdBy(request.getCreatedBy())
                .createdAt(LocalDateTime.now())
                .active(true)
                .build();
        notification = notificationRepository.save(notification);
        return toResponse(notification);
    }

    @Override
    public List<NotificationResponse> getNotificationsByReservation(Integer reservationId) {
        return notificationRepository.findAll().stream()
                .filter(n -> n.getReservation().getId().equals(reservationId))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public NotificationResponse getNotificationById(Integer id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        return toResponse(notification);
    }

    private NotificationResponse toResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .reservationId(notification.getReservation().getId())
                .notificationType(notification.getNotificationType())
                .channel(notification.getChannel())
                .message(notification.getMessage())
                .status(notification.getStatus())
                .sentDate(notification.getSentDate())
                .createdBy(notification.getCreatedBy())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}

