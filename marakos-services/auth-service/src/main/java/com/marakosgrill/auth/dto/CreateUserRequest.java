package com.marakosgrill.auth.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class CreateUserRequest {
    @Email
    @NotBlank
    private String email;
    
    // Campo opcional - si no se proporciona, se asigna "user123" por defecto
    private String password;
    
    @NotNull
    private Integer userTypeId;
    
    @NotBlank
    private String firstName;
    
    @NotBlank
    private String lastName;
    
    private String phone;
    
    // Fields for Employee
    private Long roleId;
    private Integer workShift;
    private LocalDate hireDate;
    private String employmentStatus;
    
    // Fields for Client
    private String photo;
    private LocalDate birthDate;
    private String documentId;
    private String refundAccount;
    
    // Método para debugging - verificar que no se está enviando password
    @Override
    public String toString() {
        return "CreateUserRequest{" +
                "email='" + email + '\'' +
                ", userTypeId=" + userTypeId +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", phone='" + phone + '\'' +
                ", roleId=" + roleId +
                ", workShift=" + workShift +
                '}';
    }
}