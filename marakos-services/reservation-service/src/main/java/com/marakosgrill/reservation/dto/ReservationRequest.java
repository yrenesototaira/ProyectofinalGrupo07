package com.marakosgrill.reservation.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationRequest {
    @NotNull
    private Integer customerId;
    @NotNull
    private LocalDate reservationDate;
    @NotNull
    private LocalTime reservationTime;
    @NotNull
    private Integer peopleCount;
    @NotBlank
    private String paymentMethod;
    @NotBlank
    private String reservationType; // MESA / EVENTO
    private Integer eventTypeId;
    private String eventShift; // Mañana / Tarde / Noche
    private Integer tableDistributionType;
    private Integer tableClothColor;
    private String holderDocument;
    private String holderPhone;
    private String holderName;
    private String holderEmail;
    private String observation;
    private Integer employeeId;
    private Integer createdBy;
    private List<ReservationProductRequest> products;
    private List<ReservationTableRequest> tables;
    private List<ReservationEventRequest> events;
    private List<PaymentRequest> payments;
}