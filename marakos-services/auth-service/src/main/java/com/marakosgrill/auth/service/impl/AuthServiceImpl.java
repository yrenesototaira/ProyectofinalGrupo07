package com.marakosgrill.auth.service.impl;

import com.marakosgrill.auth.dto.*;
import com.marakosgrill.auth.model.Client;
import com.marakosgrill.auth.model.Employee;
import com.marakosgrill.auth.model.User;
import com.marakosgrill.auth.model.UserType;
import com.marakosgrill.auth.repository.ClientRepository;
import com.marakosgrill.auth.repository.EmployeeRepository;
import com.marakosgrill.auth.repository.UserRepository;
import com.marakosgrill.auth.repository.UserTypeRepository;
import com.marakosgrill.auth.service.AuthService;
import com.marakosgrill.auth.service.EmailService;
import com.marakosgrill.auth.service.JwtService;
import com.marakosgrill.auth.exception.InvalidCredentialsException;
import com.marakosgrill.auth.exception.EmailAlreadyExistsException;
import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.nio.file.Files;
import java.time.LocalDateTime;
import java.util.Optional;

import static com.marakosgrill.auth.util.constant.*;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private UserTypeRepository userTypeRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ClientRepository clientRepository;
    @Autowired
    private EmployeeRepository employeeRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtService jwtService;
    @Autowired
    private EmailService emailService;

    @Override
    public AuthLoginResponse login(AuthLoginRequest request) {
         Optional<User> userOpt = userRepository.findByEmailAndActiveTrue(request.getEmail());
        if (userOpt.isEmpty()) {
            throw new InvalidCredentialsException(INVALID_CREDENTIALS_EMAIL_NOT_FOUND);
        }
        User user = userOpt.get();
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException(INVALID_CREDENTIALS_PASSWORD_INCORRECT);
        }

        String token = jwtService.generateToken(user);
        AuthLoginResponse response = new AuthLoginResponse();
        response.setToken(token);
        response.setIdUsuario(user.getId().intValue());
        response.setTipoUsuario(user.getUserType().getName());
        response.setEmail(user.getEmail());

        // Buscar datos de persona según tipo de usuario
        Integer tipoUsuario = user.getUserType().getId();
        if (USER_TYPE_CLIENT.equals(tipoUsuario)) {
            Optional<Client> clientOpt = clientRepository.findByUser(user);
            if (clientOpt.isPresent()) {
                Client client = clientOpt.get();
                response.setIdPersona(client.getId().intValue());
                response.setNombre(client.getFirstName());
                response.setApellido(client.getLastName());
                response.setTelefono(client.getPhone());
            } else {
                response.setIdPersona(null);
                response.setNombre(null);
                response.setApellido(null);
                response.setTelefono(null);
            }
        } else {
            Optional<Employee> employeeOpt = employeeRepository.findByUser(user);
            if (employeeOpt.isPresent()) {
                Employee employee = employeeOpt.get();
                response.setIdPersona(employee.getId().intValue());
                response.setNombre(employee.getFirstName());
                response.setApellido(employee.getLastName());
                response.setTelefono(employee.getPhone());
                // Incluir el nombre del rol del empleado
                if (employee.getRole() != null) {
                    response.setRol(employee.getRole().getNombre());
                }
            } else {
                response.setIdPersona(null);
                response.setNombre(null);
                response.setApellido(null);
                response.setTelefono(null);
            }
        }
        return response;
    }

    @Override
    public AuthRegisterResponse register(AuthRegisterRequest request) {
        // Verificar si existe un usuario ACTIVO con este email
        Optional<User> activeUserOpt = userRepository.findByEmailAndActiveTrue(request.getEmail());
        if (activeUserOpt.isPresent()) {
            throw new EmailAlreadyExistsException(EMAIL_ALREADY_EXISTS);
        }

        UserType userType = userTypeRepository.findById(DEFAULT_USER_TYPE_ID)
                .orElseThrow(() -> new RuntimeException(USER_TYPE_NOT_FOUND));

        // Verificar si existe un usuario INACTIVO con este email
        Optional<User> existingUserOpt = userRepository.findByEmail(request.getEmail());
        User user;
        Client client;
        
        if (existingUserOpt.isPresent() && !existingUserOpt.get().getActive()) {
            // Reactivar usuario existente inactivo
            user = existingUserOpt.get();
            user.setUserType(userType);
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setStatus(DEFAULT_STATUS_ACTIVE);
            user.setVerificationCode(null); // Limpiar código de verificación anterior
            user.setUpdatedBy(DEFAULT_CREATED_BY_USER_ID);
            user.setUpdatedAt(LocalDateTime.now());
            user.setActive(true);
            userRepository.save(user);

            // Buscar cliente existente asociado
            Optional<Client> existingClientOpt = clientRepository.findByUser(user);
            if (existingClientOpt.isPresent()) {
                // Actualizar datos del cliente existente
                client = existingClientOpt.get();
                client.setFirstName(request.getFirstName());
                client.setLastName(request.getLastName());
                client.setPhone(request.getPhone());
                client.setStatus(DEFAULT_STATUS_ACTIVE);
                client.setUpdatedBy(DEFAULT_CREATED_BY_USER_ID);
                client.setUpdatedAt(LocalDateTime.now());
                client.setActive(true);
                clientRepository.save(client);
            } else {
                // Crear nuevo cliente si no existe
                client = new Client();
                client.setUser(user);
                client.setFirstName(request.getFirstName());
                client.setLastName(request.getLastName());
                client.setPhone(request.getPhone());
                client.setStatus(DEFAULT_STATUS_ACTIVE);
                client.setCreatedBy(DEFAULT_CREATED_BY_USER_ID);
                client.setCreatedAt(LocalDateTime.now());
                client.setActive(true);
                clientRepository.save(client);
            }
        } else {
            // Crear nuevo usuario
            user = new User();
            user.setUserType(userType);
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setStatus(DEFAULT_STATUS_ACTIVE);
            user.setCreatedBy(DEFAULT_CREATED_BY_USER_ID);
            user.setCreatedAt(LocalDateTime.now());
            user.setActive(true);
            userRepository.save(user);

            // Crear nuevo cliente
            client = new Client();
            client.setUser(user);
            client.setFirstName(request.getFirstName());
            client.setLastName(request.getLastName());
            client.setPhone(request.getPhone());
            client.setStatus(DEFAULT_STATUS_ACTIVE);
            client.setCreatedBy(DEFAULT_CREATED_BY_USER_ID);
            client.setCreatedAt(LocalDateTime.now());
            client.setActive(true);
            clientRepository.save(client);
        }

        // Enviar email de bienvenida
        String htmlBody = loadWelcomeTemplate(client.getFirstName(), client.getLastName(), user.getEmail());

        try {
            emailService.sendEmailHtml(user.getEmail(), WELCOME_EMAIL_SUBJECT, htmlBody);
        } catch (MessagingException e) {
            throw new RuntimeException(e);
        }

        AuthRegisterResponse response = new AuthRegisterResponse();
        response.setUserId(user.getId());
        response.setEmail(user.getEmail());
        return response;
    }

    @Override
    public void forgotPassword(ForgotPasswordRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            throw new InvalidCredentialsException(INVALID_CREDENTIALS_EMAIL_NOT_FOUND);
        }
        User user = userOpt.get();
        String verificationCode = String.valueOf((int)((Math.random() * 900000) + 100000)); // 6 dígitos
        user.setVerificationCode(verificationCode);
        userRepository.save(user);

        String htmlBody = loadForgotPasswordTemplate(verificationCode);

        try {
            emailService.sendEmailHtml(user.getEmail(), PASSWORD_RESET_SUBJECT, htmlBody);
        } catch (MessagingException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public void resetPassword(ResetPasswordRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            throw new InvalidCredentialsException(INVALID_CREDENTIALS_EMAIL_NOT_FOUND);
        }
        User user = userOpt.get();
        if (user.getVerificationCode() == null || !user.getVerificationCode().equals(request.getVerificationCode())) {
            throw new InvalidCredentialsException(INVALID_VERIFICATION_CODE);
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setVerificationCode(null);
        userRepository.save(user);
    }

    @Override
    public void updateUserPassword(UserPasswordUpdateRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private String loadWelcomeTemplate(String firstName, String lastName, String email) {
        try {
            ClassPathResource resource = new ClassPathResource(WELCOME_EMAIL_TEMPLATE);
            String template = Files.readString(resource.getFile().toPath());
            return template
                    .replace("${firstName}", firstName)
                    .replace("${lastName}", lastName)
                    .replace("${email}", email)
                    .replace("${companyName}", COMPANY_NAME);
        } catch (Exception e) {
            throw new RuntimeException(EMAIL_TEMPLATE_LOAD_ERROR, e);
        }
    }

    private String loadForgotPasswordTemplate(String code) {
        try {
            ClassPathResource resource = new ClassPathResource(PASSWORD_RESET_EMAIL_TEMPLATE);
            String template = Files.readString(resource.getFile().toPath());
            return template
                    .replace("${verificationCode}", code)
                    .replace("${companyName}", COMPANY_NAME);
        } catch (Exception e) {
            throw new RuntimeException(EMAIL_TEMPLATE_LOAD_ERROR, e);
        }
    }
}
