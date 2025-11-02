# 🔌 DOCUMENTACIÓN DE ENDPOINTS - SISTEMA MARAKOS GRILL
## Arquitectura de Microservicios REST API

---

## 🔐 **AUTH-SERVICE** (Puerto: 8080)
### Base URL: `http://localhost:8080`

| **Método** | **Endpoint** | **Descripción** | **Autenticación** | **Body/Parámetros** |
|------------|--------------|-----------------|-------------------|---------------------|
| `POST` | `/api/auth/login` | Iniciar sesión de usuario | No | `AuthLoginRequest` |
| `POST` | `/api/auth/register` | Registrar nuevo usuario | No | `AuthRegisterRequest` |
| `POST` | `/api/auth/forgot-password` | Solicitar recuperación de contraseña | No | `ForgotPasswordRequest` |
| `POST` | `/api/auth/reset-password` | Restablecer contraseña | No | `ResetPasswordRequest` |
| `POST` | `/api/auth/update-password` | Actualizar contraseña de usuario | Sí | `UserPasswordUpdateRequest` |

### 👑 **Endpoints de Administración**

| **Método** | **Endpoint** | **Descripción** | **Autenticación** | **Parámetros** |
|------------|--------------|-----------------|-------------------|----------------|
| `GET` | `/api/admin/user-types` | Obtener tipos de usuario | Admin | - |
| `GET` | `/api/admin/roles` | Obtener roles del sistema | Admin | - |
| `POST` | `/api/admin/users` | Crear nuevo usuario | Admin | `CreateUserRequest` |
| `GET` | `/api/admin/users` | Listar todos los usuarios | Admin | - |
| `GET` | `/api/admin/users/paginated` | Usuarios paginados | Admin | `page`, `size`, `search` |
| `GET` | `/api/admin/users/{id}` | Obtener usuario por ID | Admin | `id` |
| `GET` | `/api/admin/users/{id}/detail` | Detalle completo del usuario | Admin | `id` |
| `PUT` | `/api/admin/users/{id}` | Actualizar usuario | Admin | `id`, `CreateUserRequest` |
| `DELETE` | `/api/admin/users/{id}` | Eliminar usuario | Admin | `id` |

### 🔧 **Endpoints de Debug**

| **Método** | **Endpoint** | **Descripción** | **Autenticación** | **Parámetros** |
|------------|--------------|-----------------|-------------------|----------------|
| `GET` | `/api/debug/db-connections` | Conexiones activas de BD | Dev | - |
| `GET` | `/api/debug/connection-count` | Contador de conexiones | Dev | - |
| `GET` | `/api/debug/datasource-info` | Información del DataSource | Dev | - |

---

## 👥 **CUSTOMER-SERVICE** (Puerto: 8081)
### Base URL: `http://localhost:8081`

| **Método** | **Endpoint** | **Descripción** | **Autenticación** | **Parámetros/Body** |
|------------|--------------|-----------------|-------------------|---------------------|
| `GET` | `/api/customer/findAll` | Listar todos los clientes | Sí | `status`, `name`, `lastName` |
| `GET` | `/api/customer/{id}` | Obtener cliente por ID | Sí | `id` |
| `POST` | `/api/customer` | Crear nuevo cliente | Sí | `CustomerRequest` |
| `PATCH` | `/api/customer/{id}` | Actualizar cliente | Sí | `id`, `CustomerRequest` |
| `DELETE` | `/api/customer/{id}` | Eliminar cliente | Sí | `id` |

---

## 🍽️ **MANAGEMENT-SERVICE** (Puerto: 8082)
### Base URL: `http://localhost:8082`

### 📂 **Gestión de Categorías**

| **Método** | **Endpoint** | **Descripción** | **Autenticación** | **Parámetros/Body** |
|------------|--------------|-----------------|-------------------|---------------------|
| `GET` | `/api/category/findAll` | Listar categorías | No | `name`, `active` |
| `GET` | `/api/category/{id}` | Obtener categoría por ID | No | `id` |
| `POST` | `/api/category` | Crear nueva categoría | Admin | `CategoryDTO` |
| `PATCH` | `/api/category/{id}` | Actualizar categoría | Admin | `id`, `CategoryDTO` |
| `DELETE` | `/api/category/{id}` | Eliminar categoría | Admin | `id` |

### 🍽️ **Gestión de Productos**

| **Método** | **Endpoint** | **Descripción** | **Autenticación** | **Parámetros/Body** |
|------------|--------------|-----------------|-------------------|---------------------|
| `GET` | `/api/product/findAll` | Listar productos | No | `name`, `categoryId`, `active` |
| `GET` | `/api/product/{id}` | Obtener producto por ID | No | `id` |
| `GET` | `/api/product/public` | Productos públicos (carta) | No | - |
| `POST` | `/api/product` | Crear nuevo producto | Admin | `ProductDTO` |
| `PATCH` | `/api/product/{id}` | Actualizar producto | Admin | `id`, `ProductDTO` |
| `DELETE` | `/api/product/{id}` | Eliminar producto | Admin | `id` |

### 🪑 **Gestión de Mesas**

| **Método** | **Endpoint** | **Descripción** | **Autenticación** | **Parámetros/Body** |
|------------|--------------|-----------------|-------------------|---------------------|
| `GET` | `/api/table/findAll` | Listar mesas | Admin | `status`, `active` |
| `GET` | `/api/table/{id}` | Obtener mesa por ID | Admin | `id` |
| `POST` | `/api/table` | Crear nueva mesa | Admin | `TableDTO` |
| `PATCH` | `/api/table/{id}` | Actualizar mesa | Admin | `id`, `TableDTO` |
| `DELETE` | `/api/table/{id}` | Eliminar mesa | Admin | `id` |

### 🎉 **Gestión de Servicios (Eventos)**

| **Método** | **Endpoint** | **Descripción** | **Autenticación** | **Parámetros/Body** |
|------------|--------------|-----------------|-------------------|---------------------|
| `GET` | `/api/service/findAll` | Listar servicios | No | `name`, `active` |
| `GET` | `/api/service/{id}` | Obtener servicio por ID | No | `id` |
| `POST` | `/api/service` | Crear nuevo servicio | Admin | `ServiceDTO` |
| `PATCH` | `/api/service/{id}` | Actualizar servicio | Admin | `id`, `ServiceDTO` |
| `DELETE` | `/api/service/{id}` | Eliminar servicio | Admin | `id` |

---

## 📅 **RESERVATION-SERVICE** (Puerto: 8083)
### Base URL: `http://localhost:8083`

### 🎫 **Gestión de Reservas**

| **Método** | **Endpoint** | **Descripción** | **Autenticación** | **Parámetros/Body** |
|------------|--------------|-----------------|-------------------|---------------------|
| `POST` | `/api/reservation` | Crear nueva reserva | Cliente | `ReservationRequest` |
| `GET` | `/api/reservation/{id}` | Obtener reserva por ID | Cliente | `id` |
| `GET` | `/api/reservation/customer/{customerId}` | Reservas por cliente | Cliente | `customerId` |
| `GET` | `/api/reservation/date/{date}` | Reservas por fecha | Admin | `date` |
| `PUT` | `/api/reservation/{id}` | Actualizar reserva | Cliente | `id`, `ReservationRequest` |
| `PATCH` | `/api/reservation/{id}/cancel` | Cancelar reserva | Cliente | `id` |

### ✅ **Consultas de Disponibilidad**

| **Método** | **Endpoint** | **Descripción** | **Autenticación** | **Parámetros** |
|------------|--------------|-----------------|-------------------|----------------|
| `GET` | `/api/reservation/table-availability` | Verificar disponibilidad de mesa | No | `tableId`, `date`, `time` |
| `GET` | `/api/reservation/event-availability` | Verificar disponibilidad de evento | No | `eventTypeId`, `date`, `shift` |

### 📢 **Gestión de Notificaciones**

| **Método** | **Endpoint** | **Descripción** | **Autenticación** | **Parámetros/Body** |
|------------|--------------|-----------------|-------------------|---------------------|
| `POST` | `/api/notification` | Crear notificación | Sistema | `NotificationRequest` |
| `GET` | `/api/notification/reservation/{reservationId}` | Notificaciones por reserva | Cliente | `reservationId` |
| `GET` | `/api/notification/{id}` | Obtener notificación por ID | Cliente | `id` |

---

## 💳 **PAYMENT-SERVICE** (Puerto: 8084)
### Base URL: `http://localhost:8084`

| **Método** | **Endpoint** | **Descripción** | **Autenticación** | **Parámetros/Body** |
|------------|--------------|-----------------|-------------------|---------------------|
| `POST` | `/api/payment/send` | Procesar pago interno | Cliente | `PaymentRequest` |
| `POST` | `/api/payment/culqi` | Procesar pago con Culqi | Cliente | `PaymentRequest` |
| `GET` | `/api/payment/health` | Estado del servicio | No | - |

---

## 📋 **TIPOS DE DATOS (DTOs)**

### 🔐 **Auth Service DTOs**

| **DTO** | **Campos Principales** |
|---------|----------------------|
| `AuthLoginRequest` | `email`, `password` |
| `AuthLoginResponse` | `token`, `user`, `tokenType` |
| `AuthRegisterRequest` | `nombre`, `email`, `password`, `telefono`, `tipoUsuario` |
| `AuthRegisterResponse` | `id`, `nombre`, `email`, `mensaje` |
| `ForgotPasswordRequest` | `email` |
| `ResetPasswordRequest` | `token`, `newPassword` |
| `CreateUserRequest` | `nombre`, `email`, `password`, `telefono`, `tipoUsuario` |
| `UserListResponse` | `id`, `nombre`, `email`, `telefono`, `tipoUsuario`, `fechaCreacion` |

### 👥 **Customer Service DTOs**

| **DTO** | **Campos Principales** |
|---------|----------------------|
| `CustomerRequest` | `nombre`, `apellido`, `email`, `telefono`, `fechaNacimiento`, `direccion` |
| `CustomerResponse` | `id`, `nombre`, `apellido`, `email`, `telefono`, `fechaNacimiento`, `direccion`, `registroActivo` |

### 🍽️ **Management Service DTOs**

| **DTO** | **Campos Principales** |
|---------|----------------------|
| `CategoryDTO` | `id`, `nombre`, `descripcion`, `icono`, `registroActivo` |
| `ProductDTO` | `id`, `codigo`, `nombre`, `descripcion`, `precio`, `stock`, `urlImagen`, `estado`, `categoria` |
| `ProductPublicDTO` | `id`, `codigo`, `nombre`, `descripcion`, `precio`, `urlImagen`, `categoria` |
| `TableDTO` | `id`, `numeroMesa`, `capacidad`, `ubicacion`, `estado`, `registroActivo` |
| `ServiceDTO` | `id`, `nombre`, `descripcion`, `categoria`, `precioBase`, `unidadMedida` |

### 📅 **Reservation Service DTOs**

| **DTO** | **Campos Principales** |
|---------|----------------------|
| `ReservationRequest` | `customerId`, `tableId`, `fechaReserva`, `horaInicio`, `horaFin`, `numeroPersonas`, `observaciones` |
| `ReservationResponse` | `id`, `customerId`, `tableId`, `fechaReserva`, `horaInicio`, `horaFin`, `numeroPersonas`, `estado`, `montoTotal` |
| `NotificationRequest` | `reservationId`, `tipo`, `mensaje`, `fechaEnvio` |
| `NotificationResponse` | `id`, `reservationId`, `tipo`, `mensaje`, `fechaEnvio`, `leido` |

### 💳 **Payment Service DTOs**

| **DTO** | **Campos Principales** |
|---------|----------------------|
| `PaymentRequest` | `reservationId`, `monto`, `metodoPago`, `tokenCulqi`, `email`, `description` |
| `PaymentResponse` | `id`, `reservationId`, `codigoTransaccion`, `monto`, `estado`, `culqiChargeId`, `errorMessage` |

---

## 🔑 **CÓDIGOS DE ESTADO HTTP**

### ✅ **Respuestas Exitosas**
- `200 OK` - Operación exitosa
- `201 CREATED` - Recurso creado exitosamente
- `204 NO CONTENT` - Operación exitosa sin contenido

### ⚠️ **Errores del Cliente**
- `400 BAD REQUEST` - Solicitud incorrecta
- `401 UNAUTHORIZED` - No autenticado
- `403 FORBIDDEN` - Sin permisos
- `404 NOT FOUND` - Recurso no encontrado
- `409 CONFLICT` - Conflicto (ej: email duplicado)

### 🚨 **Errores del Servidor**
- `500 INTERNAL SERVER ERROR` - Error interno del servidor
- `503 SERVICE UNAVAILABLE` - Servicio no disponible

---

## 🔐 **AUTENTICACIÓN Y AUTORIZACIÓN**

### **Headers Requeridos**
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### **Roles del Sistema**
- `Cliente` - Acceso a reservas y perfil personal
- `Empleado` - Acceso a gestión operativa
- `Administrador` - Acceso completo al sistema

### **Endpoints Públicos (Sin Autenticación)**
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/forgot-password`
- `GET /api/category/findAll`
- `GET /api/product/findAll`
- `GET /api/product/public`
- `GET /api/service/findAll`
- `GET /api/reservation/table-availability`
- `GET /api/reservation/event-availability`
- `GET /api/payment/health`

---

## 🔄 **COMUNICACIÓN ENTRE MICROSERVICIOS**

### **Referencias Cross-Service**
1. **Customer ↔ Auth**: Referencia por `email`
2. **Reservation → Customer**: `customerId`
3. **Reservation → Management**: `tableId`, `productId`
4. **Payment → Reservation**: `reservationId`
5. **Notification → Reservation**: `reservationId`

### **Patrón de Integración**
- **API REST** para comunicación síncrona
- **Event-Driven** para notificaciones asíncronas
- **Circuit Breaker** para resiliencia
- **Load Balancing** para escalabilidad

---

## 📊 **ESTADÍSTICAS DE ENDPOINTS**

| **Servicio** | **Total Endpoints** | **GET** | **POST** | **PUT/PATCH** | **DELETE** |
|--------------|-------------------|---------|----------|---------------|------------|
| **Auth Service** | 15 | 9 | 6 | 1 | 1 |
| **Customer Service** | 5 | 2 | 1 | 1 | 1 |
| **Management Service** | 20 | 12 | 4 | 4 | 4 |
| **Reservation Service** | 9 | 6 | 2 | 1 | 0 |
| **Payment Service** | 3 | 1 | 2 | 0 | 0 |
| **TOTAL** | **52** | **30** | **15** | **7** | **6** |

---

## 🧪 **TESTING DE ENDPOINTS**

### **Herramientas Recomendadas**
- **Postman** - Colección de endpoints
- **Swagger/OpenAPI** - Documentación interactiva
- **Thunder Client** - Plugin de VS Code
- **curl** - Línea de comandos

### **Variables de Entorno**
```env
AUTH_BASE_URL=http://localhost:8080
CUSTOMER_BASE_URL=http://localhost:8081
MANAGEMENT_BASE_URL=http://localhost:8082
RESERVATION_BASE_URL=http://localhost:8083
PAYMENT_BASE_URL=http://localhost:8084
JWT_SECRET=miClaveSuperSecreta1234567890abcdefg123456
```

---

*Documentación actualizada: Noviembre 2025*  
*Versión: 1.0*  
*Sistema: Marakos Grill - Microservicios*