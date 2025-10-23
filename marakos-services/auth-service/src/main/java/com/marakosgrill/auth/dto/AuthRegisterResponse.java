package com.marakosgrill.auth.dto;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuthRegisterResponse {
    private Long userId;
    private String email;
}

