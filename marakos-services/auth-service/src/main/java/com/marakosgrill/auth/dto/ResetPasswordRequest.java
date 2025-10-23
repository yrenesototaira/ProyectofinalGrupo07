package com.marakosgrill.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResetPasswordRequest {
    @Email
    @NotBlank
    private String email;
    @NotBlank
    private String verificationCode;
    @NotBlank
    private String newPassword;
}

