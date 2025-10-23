package com.marakosgrill.customer.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class CustomerResponse {
    private Long id;
    private Long userId;
    private String firstName;
    private String lastName;
    private String phone;
    private String photo;
    private LocalDate birthDate;
    private String identityDocument;
    private String financialEntity;
    private String refundAccount;
    private String status;
}

