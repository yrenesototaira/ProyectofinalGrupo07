package com.marakosgrill.management.model;

import lombok.*;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "servicio")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_servicio")
    private Integer id;

    @Column(name = "nombre", nullable = false, length = 100)
    private String name;

    @Column(name = "descripcion", length = 200)
    private String description;

    @Column(name = "unidad_medida", length = 20)
    private String unit;

    @Column(name = "precio", nullable = false)
    private BigDecimal price;

    @Column(name = "icono", length = 10)
    private String icon;

    @Column(name = "estado", length = 20)
    private String status;

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
