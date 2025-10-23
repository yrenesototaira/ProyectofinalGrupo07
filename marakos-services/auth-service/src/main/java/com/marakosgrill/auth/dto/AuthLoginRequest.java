package com.marakosgrill.auth.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuthLoginRequest {
    @Email
    @NotBlank
    private String email;
    @NotBlank
    private String password;
}

