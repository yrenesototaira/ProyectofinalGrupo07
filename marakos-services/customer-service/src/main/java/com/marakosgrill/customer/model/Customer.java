package com.marakosgrill.customer.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "cliente")
@Getter
@Setter
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cliente")
    private Long id;

    @Column(name = "id_usuario", nullable = false)
    private Long userId;

    @Column(name = "nombre", nullable = false, length = 100)
    private String firstName;

    @Column(name = "apellido", nullable = false, length = 100)
    private String lastName;

    @Column(name = "telefono", length = 20)
    private String phone;

    @Column(name = "foto", length = 255)
    private String photo;

    @Column(name = "fecha_nacimiento")
    private LocalDate birthDate;

    @Column(name = "documento_identidad", length = 20)
    private String identityDocument;

    @Column(name = "entidad_financiera", length = 20)
    private String financialEntity;

    @Column(name = "cuenta_rembolso", length = 20)
    private String refundAccount;

    @Column(name = "estado", length = 20)
    private String status;

    @Column(name = "id_usuario_creacion", nullable = false)
    private Long createdByUserId;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "id_usuario_modificacion")
    private Long updatedByUserId;

    @Column(name = "fecha_modificacion")
    private LocalDateTime updatedAt;

    @Column(name = "registro_activo", nullable = false)
    private Boolean active = true;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.active = true;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

