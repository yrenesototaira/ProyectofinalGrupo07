package com.marakosgrill.auth.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserTypeResponse {
    private Integer id;
    private String name;
    private String description;
}