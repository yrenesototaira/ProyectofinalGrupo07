package com.marakosgrill.auth.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "empleado")
@Getter
@Setter
public class Employee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_empleado")
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_rol", nullable = false)
    private Rol role;

    @Column(name = "turno_laboral")
    private Integer workShift;

    @Column(name = "fecha_ingreso")
    private LocalDate hireDate;

    @Column(name = "estado_laboral")
    private String employmentStatus;

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
