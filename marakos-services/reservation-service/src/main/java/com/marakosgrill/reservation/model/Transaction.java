package com.marakosgrill.reservation.model;

import lombok.*;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transaccion")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_transaccion")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_reserva", nullable = false)
    private Reservation reservation;

    @Column(name = "fecha_pago", nullable = false)
    private LocalDateTime paymentDate;

    @Column(name = "metodo_pago", length = 20)
    private String paymentMethod;

    @Column(name = "monto", nullable = false)
    private BigDecimal amount;

    @Column(name = "estado", length = 20)
    private String status;

    @Column(name = "id_transaccion_externa", length = 100)
    private String externalTransactionId;

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

