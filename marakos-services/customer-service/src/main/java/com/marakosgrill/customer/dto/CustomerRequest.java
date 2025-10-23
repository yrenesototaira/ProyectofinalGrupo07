package com.marakosgrill.customer.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class CustomerRequest {
    @NotNull
    private Long userId;

    @NotBlank
    @Size(max = 100)
    private String firstName;

    @NotBlank
    @Size(max = 100)
    private String lastName;

    @Size(max = 20)
    private String phone;

    @Size(max = 255)
    private String photo;

    private LocalDate birthDate;

    @Size(max = 20)
    private String identityDocument;

    @Size(max = 20)
    private String financialEntity;

    @Size(max = 20)
    private String refundAccount;

    @Size(max = 20)
    private String status;

    @NotNull
    private Long createdByUserId;
}

