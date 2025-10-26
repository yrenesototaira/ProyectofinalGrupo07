package com.marakosgrill.auth.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuthLoginResponse {
    private String token;
    private Integer idUsuario;
    private String tipoUsuario;
    private Integer idPersona;
    private String email;
    private String nombre;
    private String apellido;
    private String telefono;
}
