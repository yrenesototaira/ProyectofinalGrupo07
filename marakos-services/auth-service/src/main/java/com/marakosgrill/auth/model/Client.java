package com.marakosgrill.auth.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "cliente")
@Getter
@Setter
public class Client {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cliente")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private User user;

    @Column(name = "nombre", nullable = false)
    private String firstName;

    @Column(name = "apellido", nullable = false)
    private String lastName;

    @Column(name = "telefono")
    private String phone;

    @Column(name = "foto")
    private String photo;

    @Column(name = "fecha_nacimiento")
    private LocalDate birthDate;

    @Column(name = "documento_identidad")
    private String documentId;

    @Column(name = "cuenta_rembolso")
    private String refundAccount;

    @Column(name = "fecha_registro")
    private LocalDateTime registrationDate;

    @Column(name = "estado")
    private String status;

    @Column(name = "id_usuario_creacion", nullable = false)
    private Long createdBy;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "id_usuario_modificacion")
    private Long updatedBy;

    @Column(name = "fecha_modificacion")
    private LocalDateTime updatedAt;

    @Column(name = "registro_activo", nullable = false)
    private Boolean active;
}

