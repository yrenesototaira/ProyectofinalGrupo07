package com.marakosgrill.auth.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class UserDetailResponse {
    private Long id;
    private String email;
    private Integer userTypeId;
    private String userTypeName;
    private String firstName;
    private String lastName;
    private String phone;
    private Boolean active;
    
    // Campos específicos para Cliente
    private String photo;
    private LocalDate birthDate;
    private String documentId;
    private String refundAccount;
    
    // Campos específicos para Empleado
    private Long roleId;
    private String roleName;
    private Integer workShift;
    private LocalDate hireDate;
    private String employmentStatus;
}