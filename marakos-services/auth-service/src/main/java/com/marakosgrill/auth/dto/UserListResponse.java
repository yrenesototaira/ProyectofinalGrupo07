package com.marakosgrill.auth.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class UserListResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String role;
    private String userType;
    private LocalDateTime createdAt;
    private Boolean active;
}