package com.marakosgrill.notification.service;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservationNotificationData {
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private String reservationCode;
    private String reservationDate;
    private String reservationTime;
    private Integer guestCount;
    private String tableInfo;
    private String specialRequests;
    private String paymentType; // "online" o "presencial"
    private String paymentStatus; // "PAGADO", "PENDIENTE", etc.
    private Double totalAmount;
    private String reservationStatus; // "CONFIRMADA", "CANCELADA", etc.
}