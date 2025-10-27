package com.marakosgrill.auth.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RoleResponse {
    private Long id;
    private String nombre;
    private String descripcion;
}