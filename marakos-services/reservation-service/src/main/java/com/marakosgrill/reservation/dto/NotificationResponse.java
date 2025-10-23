package com.marakosgrill.reservation.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {
    private Integer id;
    private Integer reservationId;
    private String notificationType;
    private String channel;
    private String message;
    private String status;
    private LocalDateTime sentDate;
    private Integer createdBy;
    private LocalDateTime createdAt;
}

