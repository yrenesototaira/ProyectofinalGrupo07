package com.marakosgrill.auth.util;

public class constant {
    public static final String COMPANY_NAME = "Marakos Grill";
    public static final String INVALID_CREDENTIALS_EMAIL_NOT_FOUND = "Correo electrónico no encontrado";
    public static final String INVALID_CREDENTIALS_PASSWORD_INCORRECT = "Contraseña incorrecta";
    public static final String EMAIL_ALREADY_EXISTS = "Correo electrónico ya registrado";
    public static final String INVALID_VERIFICATION_CODE = "Código de verificación inválido";
    public static final String EMAIL_TEMPLATE_LOAD_ERROR = "No se pudo cargar la plantilla de correo";
    public static final String PASSWORD_RESET_SUBJECT = "Restablecimiento de contraseña - Marakos Grill";
    public static final String WELCOME_EMAIL_SUBJECT = "¡Bienvenido a " + COMPANY_NAME + "!";
    public static final String PASSWORD_RESET_EMAIL_TEMPLATE = "templates/password_reset_email.html";
    public static final String WELCOME_EMAIL_TEMPLATE = "templates/welcome_email.html";

    public static final Integer DEFAULT_USER_TYPE_ID = 1;
    public static final String USER_TYPE_NOT_FOUND = "Tipo de usuario no encontrado";
    public static final String DEFAULT_STATUS_ACTIVE = "ACTIVO";
    public static final Long DEFAULT_CREATED_BY_USER_ID = 1L; // ID del usuario de creación, por defecto 1 (admin)
}
