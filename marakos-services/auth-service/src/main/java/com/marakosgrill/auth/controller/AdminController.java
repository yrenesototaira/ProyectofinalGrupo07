package com.marakosgrill.auth.controller;

import com.marakosgrill.auth.dto.*;
import com.marakosgrill.auth.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/user-types")
    // @PreAuthorize("hasRole('ADMIN')") // Comentado temporalmente para desarrollo
    public ResponseEntity<List<UserTypeResponse>> getUserTypes() {
        try {
            List<UserTypeResponse> userTypes = adminService.getAllUserTypes();
            return ResponseEntity.ok(userTypes);
        } catch (Exception e) {
            e.printStackTrace(); // Para debugging
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/roles")
    // @PreAuthorize("hasRole('ADMIN')") // Comentado temporalmente para desarrollo
    public ResponseEntity<List<RoleResponse>> getRoles() {
        try {
            List<RoleResponse> roles = adminService.getAllRoles();
            return ResponseEntity.ok(roles);
        } catch (Exception e) {
            e.printStackTrace(); // Para debugging
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/users")
    // @PreAuthorize("hasRole('ADMIN')") // Comentado temporalmente para desarrollo
    public ResponseEntity<?> createUser(@Valid @RequestBody CreateUserRequest request) {
        try {
            CreateUserResponse response = adminService.createUser(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            e.printStackTrace(); // Para debugging
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace(); // Para debugging
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error interno", "Ha ocurrido un error inesperado"));
        }
    }

    @GetMapping("/users")
    // @PreAuthorize("hasRole('ADMIN')") // Comentado temporalmente para desarrollo
    public ResponseEntity<List<UserListResponse>> getAllUsers() {
        try {
            List<UserListResponse> users = adminService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            e.printStackTrace(); // Para debugging
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/users/paginated")
    // @PreAuthorize("hasRole('ADMIN')") // Comentado temporalmente para desarrollo
    public ResponseEntity<PagedUserResponse> getUsersPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size,
            @RequestParam(required = false) String search) {
        try {
            PagedUserResponse users = adminService.getUsersPaginated(page, size, search);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            e.printStackTrace(); // Para debugging
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/users/{id}")
    // @PreAuthorize("hasRole('ADMIN')") // Comentado temporalmente para desarrollo
    public ResponseEntity<UserListResponse> getUserById(@PathVariable Long id) {
        try {
            UserListResponse user = adminService.getUserById(id);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            e.printStackTrace(); // Para debugging
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(null);
        } catch (Exception e) {
            e.printStackTrace(); // Para debugging
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/users/{id}/detail")
    // @PreAuthorize("hasRole('ADMIN')") // Comentado temporalmente para desarrollo
    public ResponseEntity<UserDetailResponse> getUserDetailById(@PathVariable Long id) {
        try {
            UserDetailResponse user = adminService.getUserDetailById(id);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            e.printStackTrace(); // Para debugging
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(null);
        } catch (Exception e) {
            e.printStackTrace(); // Para debugging
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/users/{id}")
    // @PreAuthorize("hasRole('ADMIN')") // Comentado temporalmente para desarrollo
    public ResponseEntity<?> updateUser(@PathVariable Long id, @Valid @RequestBody CreateUserRequest request) {
        try {
            CreateUserResponse response = adminService.updateUser(id, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            e.printStackTrace(); // Para debugging
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace(); // Para debugging
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error interno", "Ha ocurrido un error inesperado"));
        }
    }

    @DeleteMapping("/users/{id}")
    // @PreAuthorize("hasRole('ADMIN')") // Comentado temporalmente para desarrollo
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            adminService.deleteUser(id);
            return ResponseEntity.ok(new SuccessResponse("Usuario eliminado exitosamente"));
        } catch (RuntimeException e) {
            e.printStackTrace(); // Para debugging
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace(); // Para debugging
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error interno", "Ha ocurrido un error inesperado"));
        }
    }

    // Error response class
    public static class ErrorResponse {
        private String error;
        private String message;

        public ErrorResponse(String error, String message) {
            this.error = error;
            this.message = message;
        }

        public String getError() {
            return error;
        }

        public void setError(String error) {
            this.error = error;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }

    // Success response class
    public static class SuccessResponse {
        private String message;

        public SuccessResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}