package com.marakosgrill.reservation.model;

import lombok.*;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "reserva")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reservation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_reserva")
    private Integer id;

    @Column(name = "codigo_reserva", nullable = false, unique = true, length = 50)
    private String code;

    @Column(name = "id_cliente", nullable = false)
    private Integer customerId;

    @Column(name = "fecha_reserva", nullable = false)
    private LocalDate reservationDate;

    @Column(name = "hora_reserva")
    private LocalTime reservationTime;

    @Column(name = "cantidad_personas", nullable = false)
    private Integer peopleCount;

    @Column(name = "estado", length = 20)
    private String status;

    @Column(name = "forma_pago", length = 20)
    private String paymentMethod;

    @Column(name = "tipo_reserva", length = 20)
    private String reservationType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tipo_evento")
    private EventType eventType;

    @Column(name = "turno_evento")
    private Integer eventShift;

    @Column(name = "tipo_distribucion_mesa")
    private Integer tableDistributionType;

    @Column(name = "color_manteleria_mesa")
    private Integer tableClothColor;

    @Column(name = "documento_identidad_titular", length = 20)
    private String holderDocument;

    @Column(name = "telefono_titular", length = 20)
    private String holderPhone;

    @Column(name = "nombre_titular", length = 100)
    private String holderName;

    @Column(name = "email_titular", length = 100)
    private String holderEmail;

    @Column(name = "fecha_cancelacion")
    private LocalDateTime cancellationDate;

    @Column(name = "observacion", length = 500)
    private String observation;

    @Column(name = "tyc", nullable = false)
    private Integer termsAccepted;

    @Column(name = "id_empleado")
    private Integer employeeId;

    @Column(name = "id_usuario_creacion", nullable = false)
    private Integer createdBy;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "id_usuario_modificacion")
    private Integer updatedBy;

    @Column(name = "fecha_modificacion")
    private LocalDateTime updatedAt;

    @Column(name = "registro_activo", nullable = false)
    private Boolean active;
}