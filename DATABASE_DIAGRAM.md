# 🗄️ Diagrama de Base de Datos - Marakos Grill

## 📊 Diagrama Visual de Entidad-Relación

```mermaid
erDiagram
    %% ===== MICROSERVICIO AUTH =====
    USUARIO ||--o{ RESERVA : "hace"
    USUARIO {
        int id_usuario PK
        varchar nombre
        varchar email UK
        varchar password
        varchar telefono
        varchar tipo_usuario "Cliente/Empleado"
        boolean registro_activo
        timestamp fecha_creacion
        timestamp fecha_modificacion
        varchar usuario_creacion
        varchar usuario_modificacion
    }

    %% ===== MICROSERVICIO CUSTOMER =====
    CLIENTE ||--o{ RESERVA : "realiza"
    CLIENTE {
        int id_cliente PK
        varchar nombre
        varchar apellido
        varchar email UK
        varchar telefono
        date fecha_nacimiento
        varchar direccion
        boolean registro_activo
        timestamp fecha_creacion
        timestamp fecha_modificacion
        varchar usuario_creacion
        varchar usuario_modificacion
    }

    %% ===== MICROSERVICIO MANAGEMENT =====
    CATEGORIA ||--o{ PRODUCTO : "contiene"
    CATEGORIA {
        int id_categoria PK
        varchar nombre
        varchar descripcion
        varchar icono
        boolean registro_activo
        timestamp fecha_creacion
        timestamp fecha_modificacion
        varchar usuario_creacion
        varchar usuario_modificacion
    }

    PRODUCTO {
        int id_producto PK
        int id_categoria FK
        varchar codigo UK
        varchar nombre
        varchar descripcion
        decimal precio
        int stock
        varchar url_imagen
        varchar estado "Disponible/Agotado"
        boolean registro_activo
        timestamp fecha_creacion
        timestamp fecha_modificacion
        varchar usuario_creacion
        varchar usuario_modificacion
    }

    %% ===== MICROSERVICIO RESERVATION =====
    CLIENTE ||--o{ RESERVA : "titular"
    MESA ||--o{ RESERVA : "asignada"
    RESERVA ||--o{ DETALLE_RESERVA : "contiene"
    RESERVA ||--o{ PAGO : "genera"
    
    MESA {
        int id_mesa PK
        int numero_mesa UK
        int capacidad
        varchar ubicacion
        varchar estado "Disponible/Ocupada/Reservada/Mantenimiento"
        boolean registro_activo
        timestamp fecha_creacion
        timestamp fecha_modificacion
        varchar usuario_creacion
        varchar usuario_modificacion
    }

    RESERVA {
        int id_reserva PK
        int id_cliente FK
        int id_mesa FK
        date fecha_reserva
        time hora_inicio
        time hora_fin
        int numero_personas
        varchar estado "Pendiente/Confirmada/Cancelada/Completada"
        varchar observaciones
        decimal monto_total
        boolean registro_activo
        timestamp fecha_creacion
        timestamp fecha_modificacion
        varchar usuario_creacion
        varchar usuario_modificacion
    }

    PRODUCTO ||--o{ DETALLE_RESERVA : "ordenado"
    DETALLE_RESERVA {
        int id_detalle PK
        int id_reserva FK
        int id_producto FK
        int cantidad
        decimal precio_unitario
        decimal subtotal
        varchar observaciones
        timestamp fecha_creacion
        varchar usuario_creacion
    }

    %% ===== MICROSERVICIO PAYMENT =====
    RESERVA ||--o{ PAGO : "relacionado"
    PAGO {
        int id_pago PK
        int id_reserva FK
        varchar codigo_transaccion UK
        decimal monto
        varchar metodo_pago "Tarjeta/Efectivo/Transferencia"
        varchar estado_pago "Pendiente/Completado/Fallido/Reembolsado"
        varchar proveedor_pago "Culqi/Interno"
        varchar token_culqi
        varchar respuesta_culqi
        timestamp fecha_pago
        timestamp fecha_creacion
        timestamp fecha_modificacion
        varchar usuario_creacion
        varchar usuario_modificacion
    }

    %% ===== MICROSERVICIO EVENT-PLANNING =====
    CLIENTE ||--o{ EVENTO : "organiza"
    EVENTO ||--o{ DETALLE_EVENTO : "incluye"
    EVENTO {
        int id_evento PK
        int id_cliente FK
        varchar nombre_evento
        varchar tipo_evento "Cumpleaños/Matrimonio/Corporativo/Otro"
        date fecha_evento
        time hora_inicio
        time hora_fin
        int numero_invitados
        varchar estado "Cotizacion/Confirmado/Cancelado/Completado"
        decimal presupuesto_estimado
        decimal monto_total
        varchar observaciones
        boolean registro_activo
        timestamp fecha_creacion
        timestamp fecha_modificacion
        varchar usuario_creacion
        varchar usuario_modificacion
    }

    SERVICIO ||--o{ DETALLE_EVENTO : "incluido"
    SERVICIO {
        int id_servicio PK
        varchar nombre
        varchar descripcion
        varchar categoria "Decoracion/Catering/Musica/Fotografia"
        decimal precio_base
        varchar unidad_medida "Por persona/Por evento/Por hora"
        boolean registro_activo
        timestamp fecha_creacion
        timestamp fecha_modificacion
        varchar usuario_creacion
        varchar usuario_modificacion
    }

    DETALLE_EVENTO {
        int id_detalle_evento PK
        int id_evento FK
        int id_servicio FK
        int cantidad
        decimal precio_unitario
        decimal subtotal
        varchar observaciones
        timestamp fecha_creacion
        varchar usuario_creacion
    }

    EVENTO ||--o{ PAGO_EVENTO : "requiere"
    PAGO_EVENTO {
        int id_pago_evento PK
        int id_evento FK
        varchar codigo_transaccion UK
        decimal monto
        varchar metodo_pago
        varchar estado_pago
        varchar tipo_pago "Adelanto/Total/Complemento"
        timestamp fecha_pago
        timestamp fecha_creacion
        varchar usuario_creacion
    }
```

## 📋 Descripción de Microservicios y Tablas

### 🔐 **AUTH-SERVICE (Puerto 8080)**
**Propósito:** Autenticación y autorización del sistema

| Tabla | Descripción | Campos Principales |
|-------|-------------|-------------------|
| `USUARIO` | Usuarios del sistema (clientes y empleados) | id, email, password, tipo_usuario |

### 👥 **CUSTOMER-SERVICE (Puerto 8081)**
**Propósito:** Gestión de información de clientes

| Tabla | Descripción | Campos Principales |
|-------|-------------|-------------------|
| `CLIENTE` | Información detallada de clientes | id, nombre, apellido, email, telefono |

### 🍽️ **MANAGEMENT-SERVICE (Puerto 8082)**
**Propósito:** Gestión de carta y productos del restaurante

| Tabla | Descripción | Campos Principales |
|-------|-------------|-------------------|
| `CATEGORIA` | Categorías de productos (Entradas, Carnes, etc.) | id, nombre, descripcion, icono |
| `PRODUCTO` | Productos del menú | id, codigo, nombre, precio, stock, url_imagen |

### 📅 **RESERVATION-SERVICE (Puerto 8083)**
**Propósito:** Gestión de reservas y mesas

| Tabla | Descripción | Campos Principales |
|-------|-------------|-------------------|
| `MESA` | Mesas del restaurante | id, numero_mesa, capacidad, estado |
| `RESERVA` | Reservas de mesas | id, fecha_reserva, hora_inicio, estado |
| `DETALLE_RESERVA` | Productos ordenados en la reserva | id, cantidad, precio_unitario |

### 💳 **PAYMENT-SERVICE (Puerto 8084)**
**Propósito:** Procesamiento de pagos con Culqi

| Tabla | Descripción | Campos Principales |
|-------|-------------|-------------------|
| `PAGO` | Transacciones de pago | id, codigo_transaccion, monto, estado_pago |

### 🎉 **EVENT-PLANNING-SERVICE (Puerto 8085)**
**Propósito:** Planificación de eventos especiales

| Tabla | Descripción | Campos Principales |
|-------|-------------|-------------------|
| `EVENTO` | Eventos planificados | id, nombre_evento, fecha_evento, presupuesto |
| `SERVICIO` | Servicios disponibles para eventos | id, nombre, categoria, precio_base |
| `DETALLE_EVENTO` | Servicios incluidos en cada evento | id, cantidad, precio_unitario |
| `PAGO_EVENTO` | Pagos relacionados con eventos | id, tipo_pago, monto |

## 🔗 Relaciones Principales

### **Relaciones Inter-Microservicios:**
1. **USUARIO ↔ CLIENTE**: Vinculados por email (un usuario puede ser cliente)
2. **CLIENTE → RESERVA**: Un cliente puede hacer múltiples reservas
3. **CLIENTE → EVENTO**: Un cliente puede organizar múltiples eventos
4. **RESERVA → PAGO**: Cada reserva puede tener múltiples pagos
5. **EVENTO → PAGO_EVENTO**: Cada evento puede tener múltiples pagos

### **Relaciones Intra-Microservicio:**
1. **CATEGORIA → PRODUCTO**: Una categoría contiene múltiples productos
2. **MESA → RESERVA**: Una mesa puede tener múltiples reservas
3. **RESERVA → DETALLE_RESERVA**: Una reserva puede tener múltiples productos
4. **EVENTO → DETALLE_EVENTO**: Un evento puede incluir múltiples servicios

## 📊 Cardinalidades

| Relación | Cardinalidad | Descripción |
|----------|--------------|-------------|
| USUARIO → RESERVA | 1:N | Un usuario puede hacer múltiples reservas |
| CLIENTE → RESERVA | 1:N | Un cliente puede hacer múltiples reservas |
| MESA → RESERVA | 1:N | Una mesa puede ser reservada múltiples veces |
| CATEGORIA → PRODUCTO | 1:N | Una categoría tiene múltiples productos |
| RESERVA → DETALLE_RESERVA | 1:N | Una reserva puede tener múltiples productos |
| RESERVA → PAGO | 1:N | Una reserva puede tener múltiples pagos |
| CLIENTE → EVENTO | 1:N | Un cliente puede organizar múltiples eventos |
| EVENTO → DETALLE_EVENTO | 1:N | Un evento puede tener múltiples servicios |
| SERVICIO → DETALLE_EVENTO | 1:N | Un servicio puede estar en múltiples eventos |

## 🔧 Campos de Auditoría Estándar

Todas las tablas incluyen campos de auditoría:
- `registro_activo`: Boolean para soft delete
- `fecha_creacion`: Timestamp de creación
- `fecha_modificacion`: Timestamp de última actualización
- `usuario_creacion`: Usuario que creó el registro
- `usuario_modificacion`: Usuario que modificó el registro

## 🌐 Integración con Frontend

El frontend Angular se conecta a estos microservicios a través de:
- **AuthService** → AUTH-SERVICE
- **MenuService** → MANAGEMENT-SERVICE  
- **BookingService** → RESERVATION-SERVICE
- **PaymentService** → PAYMENT-SERVICE
- **EventService** → EVENT-PLANNING-SERVICE

## 🔒 Consideraciones de Seguridad

1. **Autenticación JWT** centralizada en AUTH-SERVICE
2. **Validación de datos** en cada microservicio
3. **Cifrado de contraseñas** con BCrypt
4. **Logs de auditoría** en todas las operaciones
5. **Validación de permisos** por tipo de usuario

---

*Este diagrama representa la estructura completa de la base de datos distribuida del sistema Marakos Grill, diseñada con arquitectura de microservicios para escalabilidad y mantenibilidad.*