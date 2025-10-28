package com.marakosgrill.management.model;

import lombok.*;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "producto")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_producto")
    private Integer id;

    @Column(name = "codigo", nullable = false, unique = true, length = 20)
    private String code;

    @Column(name = "nombre", nullable = false, length = 100)
    private String name;

    @Column(name = "descripcion", length = 200)
    private String description;

    @Column(name = "precio", nullable = false)
    private BigDecimal price;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_categoria", nullable = false)
    private Category category;

    @Column(name = "stock", nullable = false)
    private Integer stock;

    @Column(name = "url_imagen", length = 255)
    private String pictureUrl;

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

