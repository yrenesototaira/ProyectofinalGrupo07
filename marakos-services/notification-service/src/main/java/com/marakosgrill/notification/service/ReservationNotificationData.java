package com.marakosgrill.notification.service;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

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
    private String reservationType; // "MESA" o "EVENTO"
    private Long reservationId; // ID para generar QR
    private Boolean hasPreOrder; // Indica si tiene pre-orden de comida
    private List<OrderItem> orderItems; // Detalle de la pre-orden
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItem {
        private String productName;
        private Integer quantity;
        private Double unitPrice;
        private Double subtotal;
    }
}