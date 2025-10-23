package com.marakosgrill.reservation.service;

import com.marakosgrill.reservation.dto.NotificationRequest;
import com.marakosgrill.reservation.dto.NotificationResponse;
import java.util.List;

public interface NotificationService {
    NotificationResponse createNotification(NotificationRequest request);
    List<NotificationResponse> getNotificationsByReservation(Integer reservationId);
    NotificationResponse getNotificationById(Integer id);
}

