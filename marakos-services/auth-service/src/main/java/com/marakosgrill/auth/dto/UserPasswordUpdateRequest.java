package com.marakosgrill.auth.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserPasswordUpdateRequest {
    private Long userId;
    private String newPassword;
}

