package com.marakosgrill.reservation.model;

import lombok.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reserva_mesa")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationTable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_reserva_mesa")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_reserva", nullable = false)
    private Reservation reservation;

    @Column(name = "id_mesa", nullable = false)
    private Integer tableId;

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

