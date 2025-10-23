package com.marakosgrill.reservation.dto;

import lombok.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationRequest {
    @NotNull
    private Integer reservationId;
    @NotBlank
    private String notificationType; // e.g. CREATION, UPDATE, CANCEL, PAYMENT
    @NotBlank
    private String channel; // e.g. EMAIL, SMS
    @NotBlank
    private String message;
    @NotBlank
    private String status; // e.g. PENDING, SENT
    private LocalDateTime sentDate;
    @NotNull
    private Integer createdBy;
}

