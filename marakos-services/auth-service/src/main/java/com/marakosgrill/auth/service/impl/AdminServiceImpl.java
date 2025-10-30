package com.marakosgrill.auth.service.impl;

import com.marakosgrill.auth.dto.*;
import com.marakosgrill.auth.model.*;
import com.marakosgrill.auth.repository.*;
import com.marakosgrill.auth.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import static com.marakosgrill.auth.util.constant.*;

@Service
public class AdminServiceImpl implements AdminService {

    @Autowired
    private UserTypeRepository userTypeRepository;
    
    @Autowired
    private RolRepository rolRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ClientRepository clientRepository;
    
    @Autowired
    private EmployeeRepository employeeRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public List<UserTypeResponse> getAllUserTypes() {
        return userTypeRepository.findByActiveTrue().stream()
                .map(this::mapToUserTypeResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<RoleResponse> getAllRoles() {
        return rolRepository.findByRegistroActivoTrue().stream()
                .map(this::mapToRoleResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CreateUserResponse createUser(CreateUserRequest request) {
        try {
            // Validate email doesn't exist
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new RuntimeException("El correo electrónico ya está registrado");
            }

            // Get user type
            UserType userType = userTypeRepository.findById(request.getUserTypeId())
                    .orElseThrow(() -> new RuntimeException("Tipo de usuario no encontrado"));

            // Create user
            User user = new User();
            user.setUserType(userType);
            user.setEmail(request.getEmail());
            
            // Asignar contraseña por defecto si no se proporciona desde el frontend
            String password = (request.getPassword() != null && !request.getPassword().trim().isEmpty()) 
                ? request.getPassword() 
                : "user123";
            user.setPassword(passwordEncoder.encode(password));
            
            // Estado activo por defecto
            user.setStatus("ACTIVE");
            user.setCreatedBy(DEFAULT_CREATED_BY_USER_ID);
            user.setCreatedAt(LocalDateTime.now());
            user.setActive(true);
            
            User savedUser = userRepository.save(user);

            // Create client or employee based on user type
            System.out.println("User type detected: " + userType.getName());
            try {
                if ("Cliente".equalsIgnoreCase(userType.getName())) {
                    System.out.println("Creating Client for user: " + savedUser.getEmail());
                    createClient(savedUser, request);
                    System.out.println("Client creation completed");
                } else if ("Empleado".equalsIgnoreCase(userType.getName())) {
                    System.out.println("Creating Employee for user: " + savedUser.getEmail());
                    createEmployee(savedUser, request);
                    System.out.println("Employee creation completed");
                } else {
                    System.out.println("Unknown user type: " + userType.getName() + " - No additional entity created");
                }
            } catch (Exception e) {
                System.err.println("Error creating related entity: " + e.getMessage());
                e.printStackTrace();
                throw new RuntimeException("Error creating related entity: " + e.getMessage(), e);
            }

            CreateUserResponse response = new CreateUserResponse();
            response.setMessage("Usuario creado exitosamente. El usuario deberá establecer su contraseña usando la opción 'Olvidé mi contraseña' en el login.");
            response.setUserId(savedUser.getId());
            return response;
        } catch (Exception e) {
            e.printStackTrace(); // Para debug
            throw new RuntimeException("Error creating user: " + e.getMessage(), e);
        }
    }

    private void createClient(User user, CreateUserRequest request) {
        try {
            Client client = new Client();
            client.setUser(user);
            client.setFirstName(request.getFirstName());
            client.setLastName(request.getLastName());
            client.setPhone(request.getPhone());
            
            // Campos específicos de Cliente (opcionales)
            if (request.getPhoto() != null && !request.getPhoto().trim().isEmpty()) {
                client.setPhoto(request.getPhoto());
            }
            if (request.getBirthDate() != null) {
                client.setBirthDate(request.getBirthDate());
            }
            if (request.getDocumentId() != null && !request.getDocumentId().trim().isEmpty()) {
                client.setDocumentId(request.getDocumentId());
            }
            if (request.getRefundAccount() != null && !request.getRefundAccount().trim().isEmpty()) {
                client.setRefundAccount(request.getRefundAccount());
            }
            
            // Campos de auditoría
            client.setStatus(DEFAULT_STATUS_ACTIVE);
            client.setCreatedBy(DEFAULT_CREATED_BY_USER_ID);
            client.setCreatedAt(LocalDateTime.now());
            client.setActive(true);
            
            clientRepository.save(client);
            System.out.println("Client created successfully for user: " + user.getEmail());
        } catch (Exception e) {
            System.err.println("Error in createClient: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    private void createEmployee(User user, CreateUserRequest request) {
        try {
            // Validate role exists
            if (request.getRoleId() == null) {
                throw new RuntimeException("Se requiere un rol para empleados");
            }
            
            Rol role = rolRepository.findById(request.getRoleId())
                    .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

            Employee employee = new Employee();
            employee.setUser(user);
            employee.setFirstName(request.getFirstName());
            employee.setLastName(request.getLastName());
            employee.setPhone(request.getPhone());
            employee.setRole(role);
            
            // Campos específicos de Empleado (opcionales)
            if (request.getWorkShift() != null) {
                employee.setWorkShift(request.getWorkShift());
            }
            if (request.getHireDate() != null) {
                employee.setHireDate(request.getHireDate());
            } else {
                employee.setHireDate(LocalDateTime.now().toLocalDate());
            }
            if (request.getEmploymentStatus() != null && !request.getEmploymentStatus().trim().isEmpty()) {
                employee.setEmploymentStatus(request.getEmploymentStatus());
            } else {
                employee.setEmploymentStatus("ACTIVO");
            }
            
            // Campos de auditoría
            employee.setCreatedBy(DEFAULT_CREATED_BY_USER_ID);
            employee.setCreatedAt(LocalDateTime.now());
            employee.setActive(true);
            
            employeeRepository.save(employee);
            System.out.println("Employee created successfully for user: " + user.getEmail());
        } catch (Exception e) {
            System.err.println("Error in createEmployee: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Override
    public List<UserListResponse> getAllUsers() {
        try {
            List<User> users = userRepository.findByActiveTrueOrderByCreatedAtDesc();
            return users.stream()
                    .map(this::mapToUserListResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            System.err.println("Error getting all users: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error getting users: " + e.getMessage(), e);
        }
    }

    private UserListResponse mapToUserListResponse(User user) {
        UserListResponse response = new UserListResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setCreatedAt(user.getCreatedAt());
        response.setActive(user.getActive());
        
        // Set user type
        if (user.getUserType() != null) {
            response.setUserType(user.getUserType().getName());
        }
        
        // Get name and phone from Client or Employee based on user type
        if ("Cliente".equalsIgnoreCase(user.getUserType().getName())) {
            // Find client data
            clientRepository.findByUser(user).ifPresent(client -> {
                response.setName(client.getFirstName() + " " + client.getLastName());
                response.setPhone(client.getPhone());
                response.setRole("Cliente");
            });
        } else if ("Empleado".equalsIgnoreCase(user.getUserType().getName())) {
            // Find employee data
            employeeRepository.findByUser(user).ifPresent(employee -> {
                response.setName(employee.getFirstName() + " " + employee.getLastName());
                response.setPhone(employee.getPhone());
                if (employee.getRole() != null) {
                    response.setRole(employee.getRole().getNombre());
                } else {
                    response.setRole("Empleado");
                }
            });
        }
        
        // Fallback if no client/employee data found
        if (response.getName() == null) {
            response.setName("Usuario sin datos");
            response.setPhone("");
            response.setRole(user.getUserType().getName());
        }
        
        return response;
    }

    private UserTypeResponse mapToUserTypeResponse(UserType userType) {
        UserTypeResponse response = new UserTypeResponse();
        response.setId(userType.getId());
        response.setName(userType.getName());
        response.setDescription(userType.getDescription());
        return response;
    }

    private RoleResponse mapToRoleResponse(Rol rol) {
        RoleResponse response = new RoleResponse();
        response.setId(rol.getId());
        response.setNombre(rol.getNombre());
        response.setDescripcion(rol.getDescripcion());
        return response;
    }

    @Override
    public PagedUserResponse getUsersPaginated(int page, int size, String search) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<User> userPage;
            
            if (search != null && !search.trim().isEmpty()) {
                userPage = userRepository.findByActiveTrueAndSearchOrderByCreatedAtDesc(search.trim(), pageable);
            } else {
                userPage = userRepository.findByActiveTrueOrderByCreatedAtDesc(pageable);
            }
            
            List<UserListResponse> users = userPage.getContent().stream()
                    .map(this::mapToUserListResponse)
                    .collect(Collectors.toList());
            
            PagedUserResponse response = new PagedUserResponse();
            response.setUsers(users);
            response.setCurrentPage(userPage.getNumber());
            response.setTotalPages(userPage.getTotalPages());
            response.setTotalElements(userPage.getTotalElements());
            response.setSize(userPage.getSize());
            response.setHasNext(userPage.hasNext());
            response.setHasPrevious(userPage.hasPrevious());
            
            return response;
        } catch (Exception e) {
            System.err.println("Error getting paginated users: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error getting paginated users: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + userId));
            
            // Eliminación lógica
            user.setActive(false);
            user.setUpdatedAt(LocalDateTime.now());
            // TODO: Set updatedBy with current user ID when authentication is implemented
            user.setUpdatedBy(1L); // Temporal - usar ID del admin actual
            
            userRepository.save(user);
            
            System.out.println("Usuario eliminado lógicamente: " + userId);
        } catch (Exception e) {
            System.err.println("Error deleting user: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error eliminando usuario: " + e.getMessage(), e);
        }
    }

    @Override
    public UserListResponse getUserById(Long userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + userId));
            
            if (!user.getActive()) {
                throw new RuntimeException("Usuario no activo con ID: " + userId);
            }
            
            return mapToUserListResponse(user);
        } catch (Exception e) {
            System.err.println("Error getting user by ID: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error obteniendo usuario: " + e.getMessage(), e);
        }
    }

    @Override
    public UserDetailResponse getUserDetailById(Long userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + userId));
            
            if (!user.getActive()) {
                throw new RuntimeException("Usuario no activo con ID: " + userId);
            }
            
            UserDetailResponse response = new UserDetailResponse();
            response.setId(user.getId());
            response.setEmail(user.getEmail());
            response.setUserTypeId(user.getUserType().getId());
            response.setUserTypeName(user.getUserType().getName());
            response.setActive(user.getActive());
            
            // Obtener datos específicos según el tipo de usuario
            if (user.getUserType().getId() == 1) { // Cliente
                Client client = clientRepository.findByUserId(user.getId()).orElse(null);
                if (client != null) {
                    response.setFirstName(client.getFirstName());
                    response.setLastName(client.getLastName());
                    response.setPhone(client.getPhone());
                    response.setPhoto(client.getPhoto());
                    response.setBirthDate(client.getBirthDate());
                    response.setDocumentId(client.getDocumentId());
                    response.setRefundAccount(client.getRefundAccount());
                }
            } else if (user.getUserType().getId() == 2) { // Empleado
                Employee employee = employeeRepository.findByUserId(user.getId()).orElse(null);
                if (employee != null) {
                    response.setFirstName(employee.getFirstName());
                    response.setLastName(employee.getLastName());
                    response.setPhone(employee.getPhone());
                    response.setRoleId(employee.getRole().getId());
                    response.setRoleName(employee.getRole().getNombre());
                    response.setWorkShift(employee.getWorkShift());
                    response.setHireDate(employee.getHireDate());
                    response.setEmploymentStatus(employee.getEmploymentStatus());
                }
            }
            
            return response;
        } catch (Exception e) {
            System.err.println("Error getting user detail by ID: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error obteniendo detalles del usuario: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public CreateUserResponse updateUser(Long userId, CreateUserRequest request) {
        try {
            User existingUser = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + userId));
            
            if (!existingUser.getActive()) {
                throw new RuntimeException("No se puede actualizar un usuario inactivo");
            }
            
            // Verificar si el email ya existe (excepto para el usuario actual)
            if (!existingUser.getEmail().equals(request.getEmail())) {
                if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                    throw new RuntimeException("Ya existe un usuario con el email: " + request.getEmail());
                }
            }
            
            // Actualizar datos básicos del usuario
            existingUser.setEmail(request.getEmail());
            // No se actualiza la contraseña desde el panel de administración
            // La contraseña se maneja a través del proceso "Olvidé mi contraseña"
            existingUser.setUpdatedAt(LocalDateTime.now());
            // TODO: Set updatedBy with current user ID when authentication is implemented
            existingUser.setUpdatedBy(1L); // Temporal
            
            User savedUser = userRepository.save(existingUser);
            
            // Actualizar datos específicos según el tipo de usuario
            if (savedUser.getUserType().getId() == 1) { // Cliente
                updateClientData(savedUser, request);
            } else if (savedUser.getUserType().getId() == 2) { // Empleado
                updateEmployeeData(savedUser, request);
            }
            
            CreateUserResponse response = new CreateUserResponse();
            response.setMessage("Usuario actualizado exitosamente");
            response.setUserId(savedUser.getId());
            
            return response;
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            System.err.println("Error updating user: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error actualizando usuario: " + e.getMessage(), e);
        }
    }

    private void updateClientData(User user, CreateUserRequest request) {
        try {
            Client client = clientRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Datos de cliente no encontrados"));
            
            // Actualizar campos del cliente
            client.setFirstName(request.getFirstName());
            client.setLastName(request.getLastName());
            client.setPhone(request.getPhone());
            
            if (request.getPhoto() != null && !request.getPhoto().trim().isEmpty()) {
                client.setPhoto(request.getPhoto());
            }
            if (request.getBirthDate() != null) {
                client.setBirthDate(request.getBirthDate());
            }
            if (request.getDocumentId() != null && !request.getDocumentId().trim().isEmpty()) {
                client.setDocumentId(request.getDocumentId());
            }
            if (request.getRefundAccount() != null && !request.getRefundAccount().trim().isEmpty()) {
                client.setRefundAccount(request.getRefundAccount());
            }
            
            client.setUpdatedAt(LocalDateTime.now());
            client.setUpdatedBy(1L); // Temporal
            
            clientRepository.save(client);
        } catch (Exception e) {
            throw new RuntimeException("Error actualizando datos del cliente: " + e.getMessage(), e);
        }
    }

    private void updateEmployeeData(User user, CreateUserRequest request) {
        try {
            Employee employee = employeeRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Datos de empleado no encontrados"));
            
            // Actualizar campos del empleado
            employee.setFirstName(request.getFirstName());
            employee.setLastName(request.getLastName());
            employee.setPhone(request.getPhone());
            
            // Actualizar rol si se proporciona
            if (request.getRoleId() != null) {
                Rol role = rolRepository.findById(request.getRoleId())
                        .orElseThrow(() -> new RuntimeException("Rol no encontrado con ID: " + request.getRoleId()));
                employee.setRole(role);
            }
            
            // Campos específicos de empleado (opcionales)
            if (request.getWorkShift() != null) {
                employee.setWorkShift(request.getWorkShift());
            }
            if (request.getHireDate() != null) {
                employee.setHireDate(request.getHireDate());
            }
            if (request.getEmploymentStatus() != null && !request.getEmploymentStatus().trim().isEmpty()) {
                employee.setEmploymentStatus(request.getEmploymentStatus());
            }
            
            employee.setUpdatedAt(LocalDateTime.now());
            employee.setUpdatedBy(1L); // Temporal
            
            employeeRepository.save(employee);
        } catch (Exception e) {
            throw new RuntimeException("Error actualizando datos del empleado: " + e.getMessage(), e);
        }
    }

    /**
     * Genera una contraseña temporal que será reemplazada por el usuario
     * usando el proceso "Olvidé mi contraseña"
     */
}