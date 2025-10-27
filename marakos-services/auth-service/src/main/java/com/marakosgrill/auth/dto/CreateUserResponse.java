package com.marakosgrill.auth.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateUserResponse {
    private String message;
    private Long userId;
}