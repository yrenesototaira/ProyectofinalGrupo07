package com.marakosgrill.reservation.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationResponse {
    private Integer id;
    private String code;
    private Integer customerId;
    private LocalDate reservationDate;
    private LocalTime reservationTime;
    private Integer peopleCount;
    private String status;
    private String paymentMethod;
    private String reservationType;
    private Integer eventTypeId;
    private String eventShift;
    private Integer tableDistributionType;
    private Integer tableClothColor;
    private String holderDocument;
    private String holderPhone;
    private String holderName;
    private String holderEmail;
    private String observation;
    private Integer termsAccepted;
    private Integer employeeId;
    private LocalDateTime cancellationDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean active;
    private List<ReservationProductResponse> products;
    private List<ReservationTableResponse> tables;
    private List<ReservationEventResponse> events;
    private List<PaymentResponse> payments;
}

