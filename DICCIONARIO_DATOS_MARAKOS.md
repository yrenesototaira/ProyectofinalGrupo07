# 📚 DICCIONARIO DE DATOS - SISTEMA MARAKOS GRILL
## Arquitectura de Microservicios con PostgreSQL

---

### 🏗️ **INFORMACIÓN GENERAL DEL SISTEMA**

| **Atributo** | **Valor** |
|-------------|-----------|
| **SGBD** | PostgreSQL 14+ |
| **Servidor** | AWS RDS |
| **Host** | marakosbd.cx4a2amsay8c.us-east-2.rds.amazonaws.com |
| **Puerto** | 5432 |
| **Base de Datos Principal** | db_marakos_grill |
| **Usuario** | usrDbMarakos |
| **Arquitectura** | Microservicios (5 servicios) |
| **Total de Tablas** | 11 tablas |
| **Versión del Sistema** | 1.0 |
| **Fecha de Creación** | Noviembre 2025 |

---

## 🔐 **AUTH-SERVICE** (Puerto 8080)
### Gestión de Autenticación y Autorización

#### **Tabla: USUARIO**
**Propósito:** Almacena información de autenticación para clientes y empleados del sistema.

| **Campo** | **Tipo de Dato** | **Longitud** | **Nulos** | **PK** | **FK** | **Único** | **Descripción** |
|-----------|------------------|--------------|-----------|--------|--------|-----------|-----------------|
| `id_usuario` | SERIAL | - | NO | ✅ | - | ✅ | Identificador único del usuario |
| `nombre` | VARCHAR | 100 | NO | - | - | - | Nombre completo del usuario |
| `email` | VARCHAR | 150 | NO | - | - | ✅ | Correo electrónico único |
| `password` | VARCHAR | 255 | NO | - | - | - | Contraseña encriptada (BCrypt) |
| `telefono` | VARCHAR | 20 | SÍ | - | - | - | Número de teléfono |
| `tipo_usuario` | VARCHAR | 20 | NO | - | - | - | Tipo: 'Cliente', 'Empleado' |
| `registro_activo` | BOOLEAN | - | NO | - | - | - | Estado del registro (true/false) |
| `fecha_creacion` | TIMESTAMP | - | NO | - | - | - | Fecha de creación del registro |
| `fecha_modificacion` | TIMESTAMP | - | NO | - | - | - | Fecha de última modificación |
| `usuario_creacion` | VARCHAR | 50 | NO | - | - | - | Usuario que creó el registro |
| `usuario_modificacion` | VARCHAR | 50 | SÍ | - | - | - | Usuario que modificó el registro |

**Restricciones:**
- `CHECK (tipo_usuario IN ('Cliente', 'Empleado'))`
- `DEFAULT registro_activo = true`
- `DEFAULT fecha_creacion = CURRENT_TIMESTAMP`

**Índices:**
- `idx_usuario_email` en `email`
- `idx_usuario_tipo` en `tipo_usuario`
- `idx_usuario_activo` en `registro_activo`

---

## 👥 **CUSTOMER-SERVICE** (Puerto 8081)
### Gestión de Información de Clientes

#### **Tabla: CLIENTE**
**Propósito:** Almacena información detallada de los clientes del restaurante.

| **Campo** | **Tipo de Dato** | **Longitud** | **Nulos** | **PK** | **FK** | **Único** | **Descripción** |
|-----------|------------------|--------------|-----------|--------|--------|-----------|-----------------|
| `id_cliente` | SERIAL | - | NO | ✅ | - | ✅ | Identificador único del cliente |
| `nombre` | VARCHAR | 100 | NO | - | - | - | Nombre del cliente |
| `apellido` | VARCHAR | 100 | NO | - | - | - | Apellido del cliente |
| `email` | VARCHAR | 150 | NO | - | ✅ | ✅ | Email (referencia a usuario.email) |
| `telefono` | VARCHAR | 20 | SÍ | - | - | - | Teléfono de contacto |
| `fecha_nacimiento` | DATE | - | SÍ | - | - | - | Fecha de nacimiento |
| `direccion` | TEXT | - | SÍ | - | - | - | Dirección completa |
| `registro_activo` | BOOLEAN | - | NO | - | - | - | Estado del registro |
| `fecha_creacion` | TIMESTAMP | - | NO | - | - | - | Fecha de creación |
| `fecha_modificacion` | TIMESTAMP | - | NO | - | - | - | Fecha de modificación |
| `usuario_creacion` | VARCHAR | 50 | NO | - | - | - | Usuario creador |
| `usuario_modificacion` | VARCHAR | 50 | SÍ | - | - | - | Usuario modificador |

**Relaciones:**
- `email` → `usuario.email` (Cross-service reference)

**Índices:**
- `idx_cliente_email` en `email`
- `idx_cliente_nombre` en `nombre, apellido`
- `idx_cliente_activo` en `registro_activo`

---

## 🍽️ **MANAGEMENT-SERVICE** (Puerto 8082)
### Gestión de Carta y Productos

#### **Tabla: CATEGORIA**
**Propósito:** Categorías de productos del menú del restaurante.

| **Campo** | **Tipo de Dato** | **Longitud** | **Nulos** | **PK** | **FK** | **Único** | **Descripción** |
|-----------|------------------|--------------|-----------|--------|--------|-----------|-----------------|
| `id_categoria` | SERIAL | - | NO | ✅ | - | ✅ | Identificador único de categoría |
| `nombre` | VARCHAR | 100 | NO | - | - | ✅ | Nombre de la categoría |
| `descripcion` | TEXT | - | SÍ | - | - | - | Descripción de la categoría |
| `icono` | VARCHAR | 50 | SÍ | - | - | - | Emoji o código de icono |
| `registro_activo` | BOOLEAN | - | NO | - | - | - | Estado del registro |
| `fecha_creacion` | TIMESTAMP | - | NO | - | - | - | Fecha de creación |
| `fecha_modificacion` | TIMESTAMP | - | NO | - | - | - | Fecha de modificación |
| `usuario_creacion` | VARCHAR | 50 | NO | - | - | - | Usuario creador |
| `usuario_modificacion` | VARCHAR | 50 | SÍ | - | - | - | Usuario modificador |

**Índices:**
- `idx_categoria_nombre` en `nombre`
- `idx_categoria_activo` en `registro_activo`

#### **Tabla: PRODUCTO**
**Propósito:** Productos del menú del restaurante con precios e información.

| **Campo** | **Tipo de Dato** | **Longitud** | **Nulos** | **PK** | **FK** | **Único** | **Descripción** |
|-----------|------------------|--------------|-----------|--------|--------|-----------|-----------------|
| `id_producto` | SERIAL | - | NO | ✅ | - | ✅ | Identificador único del producto |
| `id_categoria` | INTEGER | - | NO | - | ✅ | - | ID de categoría |
| `codigo` | VARCHAR | 20 | NO | - | - | ✅ | Código único del producto |
| `nombre` | VARCHAR | 150 | NO | - | - | - | Nombre del producto |
| `descripcion` | TEXT | - | SÍ | - | - | - | Descripción del producto |
| `precio` | DECIMAL | 8,2 | NO | - | - | - | Precio del producto |
| `stock` | INTEGER | - | NO | - | - | - | Cantidad disponible |
| `url_imagen` | TEXT | - | SÍ | - | - | - | URL de imagen del producto |
| `estado` | VARCHAR | 20 | NO | - | - | - | Estado: 'Disponible', 'Agotado', 'Descontinuado' |
| `registro_activo` | BOOLEAN | - | NO | - | - | - | Estado del registro |
| `fecha_creacion` | TIMESTAMP | - | NO | - | - | - | Fecha de creación |
| `fecha_modificacion` | TIMESTAMP | - | NO | - | - | - | Fecha de modificación |
| `usuario_creacion` | VARCHAR | 50 | NO | - | - | - | Usuario creador |
| `usuario_modificacion` | VARCHAR | 50 | SÍ | - | - | - | Usuario modificador |

**Relaciones:**
- `id_categoria` → `categoria.id_categoria` (FK)

**Restricciones:**
- `CHECK (precio > 0)`
- `CHECK (stock >= 0)`
- `CHECK (estado IN ('Disponible', 'Agotado', 'Descontinuado'))`
- `DEFAULT estado = 'Disponible'`

**Índices:**
- `idx_producto_categoria` en `id_categoria`
- `idx_producto_codigo` en `codigo`
- `idx_producto_estado` en `estado`
- `idx_producto_activo` en `registro_activo`

---

## 📅 **RESERVATION-SERVICE** (Puerto 8083)
### Gestión de Reservas y Mesas

#### **Tabla: MESA**
**Propósito:** Mesas disponibles en el restaurante.

| **Campo** | **Tipo de Dato** | **Longitud** | **Nulos** | **PK** | **FK** | **Único** | **Descripción** |
|-----------|------------------|--------------|-----------|--------|--------|-----------|-----------------|
| `id_mesa` | SERIAL | - | NO | ✅ | - | ✅ | Identificador único de mesa |
| `numero_mesa` | INTEGER | - | NO | - | - | ✅ | Número de mesa |
| `capacidad` | INTEGER | - | NO | - | - | - | Número máximo de personas |
| `ubicacion` | VARCHAR | 100 | SÍ | - | - | - | Ubicación (Terraza, Salón, etc.) |
| `estado` | VARCHAR | 20 | NO | - | - | - | Estado: 'Disponible', 'Ocupada', 'Reservada', 'Mantenimiento' |
| `registro_activo` | BOOLEAN | - | NO | - | - | - | Estado del registro |
| `fecha_creacion` | TIMESTAMP | - | NO | - | - | - | Fecha de creación |
| `fecha_modificacion` | TIMESTAMP | - | NO | - | - | - | Fecha de modificación |
| `usuario_creacion` | VARCHAR | 50 | NO | - | - | - | Usuario creador |
| `usuario_modificacion` | VARCHAR | 50 | SÍ | - | - | - | Usuario modificador |

**Restricciones:**
- `CHECK (capacidad > 0)`
- `CHECK (estado IN ('Disponible', 'Ocupada', 'Reservada', 'Mantenimiento'))`
- `DEFAULT estado = 'Disponible'`

**Índices:**
- `idx_mesa_numero` en `numero_mesa`
- `idx_mesa_estado` en `estado`

#### **Tabla: RESERVA**
**Propósito:** Reservas realizadas por los clientes.

| **Campo** | **Tipo de Dato** | **Longitud** | **Nulos** | **PK** | **FK** | **Único** | **Descripción** |
|-----------|------------------|--------------|-----------|--------|--------|-----------|-----------------|
| `id_reserva` | SERIAL | - | NO | ✅ | - | ✅ | Identificador único de reserva |
| `id_cliente` | INTEGER | - | NO | - | ✅ | - | ID del cliente (cross-service) |
| `id_mesa` | INTEGER | - | NO | - | ✅ | - | ID de la mesa |
| `fecha_reserva` | DATE | - | NO | - | - | - | Fecha de la reserva |
| `hora_inicio` | TIME | - | NO | - | - | - | Hora de inicio |
| `hora_fin` | TIME | - | NO | - | - | - | Hora de fin |
| `numero_personas` | INTEGER | - | NO | - | - | - | Número de comensales |
| `estado` | VARCHAR | 20 | NO | - | - | - | Estado: 'Pendiente', 'Confirmada', 'Cancelada', 'Completada' |
| `observaciones` | TEXT | - | SÍ | - | - | - | Observaciones especiales |
| `monto_total` | DECIMAL | 10,2 | NO | - | - | - | Monto total de la reserva |
| `registro_activo` | BOOLEAN | - | NO | - | - | - | Estado del registro |
| `fecha_creacion` | TIMESTAMP | - | NO | - | - | - | Fecha de creación |
| `fecha_modificacion` | TIMESTAMP | - | NO | - | - | - | Fecha de modificación |
| `usuario_creacion` | VARCHAR | 50 | NO | - | - | - | Usuario creador |
| `usuario_modificacion` | VARCHAR | 50 | SÍ | - | - | - | Usuario modificador |

**Relaciones:**
- `id_cliente` → `cliente.id_cliente` (Cross-service reference)
- `id_mesa` → `mesa.id_mesa` (FK)

**Restricciones:**
- `CHECK (numero_personas > 0)`
- `CHECK (estado IN ('Pendiente', 'Confirmada', 'Cancelada', 'Completada'))`
- `CHECK (hora_fin > hora_inicio)`
- `DEFAULT estado = 'Pendiente'`
- `DEFAULT monto_total = 0`

**Índices:**
- `idx_reserva_cliente` en `id_cliente`
- `idx_reserva_mesa` en `id_mesa`
- `idx_reserva_fecha` en `fecha_reserva`
- `idx_reserva_estado` en `estado`

#### **Tabla: DETALLE_RESERVA**
**Propósito:** Productos ordenados en cada reserva.

| **Campo** | **Tipo de Dato** | **Longitud** | **Nulos** | **PK** | **FK** | **Único** | **Descripción** |
|-----------|------------------|--------------|-----------|--------|--------|-----------|-----------------|
| `id_detalle` | SERIAL | - | NO | ✅ | - | ✅ | Identificador único del detalle |
| `id_reserva` | INTEGER | - | NO | - | ✅ | - | ID de la reserva |
| `id_producto` | INTEGER | - | NO | - | ✅ | - | ID del producto (cross-service) |
| `cantidad` | INTEGER | - | NO | - | - | - | Cantidad ordenada |
| `precio_unitario` | DECIMAL | 8,2 | NO | - | - | - | Precio unitario del producto |
| `subtotal` | DECIMAL | 10,2 | NO | - | - | - | Subtotal (cantidad × precio_unitario) |
| `observaciones` | TEXT | - | SÍ | - | - | - | Observaciones del producto |
| `fecha_creacion` | TIMESTAMP | - | NO | - | - | - | Fecha de creación |
| `usuario_creacion` | VARCHAR | 50 | NO | - | - | - | Usuario creador |

**Relaciones:**
- `id_reserva` → `reserva.id_reserva` (FK)
- `id_producto` → `producto.id_producto` (Cross-service reference)

**Restricciones:**
- `CHECK (cantidad > 0)`
- `CHECK (precio_unitario > 0)`
- `CHECK (subtotal > 0)`

**Índices:**
- `idx_detalle_reserva` en `id_reserva`
- `idx_detalle_producto` en `id_producto`

---

## 💳 **PAYMENT-SERVICE** (Puerto 8084)
### Gestión de Pagos y Transacciones

#### **Tabla: PAGO**
**Propósito:** Pagos realizados por las reservas (integración con Culqi).

| **Campo** | **Tipo de Dato** | **Longitud** | **Nulos** | **PK** | **FK** | **Único** | **Descripción** |
|-----------|------------------|--------------|-----------|--------|--------|-----------|-----------------|
| `id_pago` | SERIAL | - | NO | ✅ | - | ✅ | Identificador único del pago |
| `id_reserva` | INTEGER | - | NO | - | ✅ | - | ID de la reserva (cross-service) |
| `codigo_transaccion` | VARCHAR | 100 | NO | - | - | ✅ | Código único de transacción |
| `monto` | DECIMAL | 10,2 | NO | - | - | - | Monto del pago |
| `metodo_pago` | VARCHAR | 50 | NO | - | - | - | Método: 'Tarjeta', 'Efectivo', 'Transferencia', 'Yape', 'Plin' |
| `estado_pago` | VARCHAR | 20 | NO | - | - | - | Estado: 'Pendiente', 'Completado', 'Fallido', 'Reembolsado' |
| `proveedor_pago` | VARCHAR | 20 | NO | - | - | - | Proveedor: 'Culqi', 'Interno' |
| `token_culqi` | VARCHAR | 255 | SÍ | - | - | - | Token de transacción Culqi |
| `respuesta_culqi` | TEXT | - | SÍ | - | - | - | Respuesta JSON de Culqi |
| `fecha_pago` | TIMESTAMP | - | NO | - | - | - | Fecha y hora del pago |
| `fecha_creacion` | TIMESTAMP | - | NO | - | - | - | Fecha de creación |
| `fecha_modificacion` | TIMESTAMP | - | NO | - | - | - | Fecha de modificación |
| `usuario_creacion` | VARCHAR | 50 | NO | - | - | - | Usuario creador |
| `usuario_modificacion` | VARCHAR | 50 | SÍ | - | - | - | Usuario modificador |

**Relaciones:**
- `id_reserva` → `reserva.id_reserva` (Cross-service reference)

**Restricciones:**
- `CHECK (monto > 0)`
- `CHECK (metodo_pago IN ('Tarjeta', 'Efectivo', 'Transferencia', 'Yape', 'Plin'))`
- `CHECK (estado_pago IN ('Pendiente', 'Completado', 'Fallido', 'Reembolsado'))`
- `CHECK (proveedor_pago IN ('Culqi', 'Interno'))`
- `DEFAULT estado_pago = 'Pendiente'`
- `DEFAULT proveedor_pago = 'Culqi'`

**Índices:**
- `idx_pago_reserva` en `id_reserva`
- `idx_pago_codigo` en `codigo_transaccion`
- `idx_pago_estado` en `estado_pago`
- `idx_pago_fecha` en `fecha_pago`

---

## 🎉 **EVENT-PLANNING-SERVICE** (Puerto 8085)
### Gestión de Eventos Especiales

#### **Tabla: SERVICIO**
**Propósito:** Servicios disponibles para eventos especiales.

| **Campo** | **Tipo de Dato** | **Longitud** | **Nulos** | **PK** | **FK** | **Único** | **Descripción** |
|-----------|------------------|--------------|-----------|--------|--------|-----------|-----------------|
| `id_servicio` | SERIAL | - | NO | ✅ | - | ✅ | Identificador único del servicio |
| `nombre` | VARCHAR | 150 | NO | - | - | - | Nombre del servicio |
| `descripcion` | TEXT | - | SÍ | - | - | - | Descripción del servicio |
| `categoria` | VARCHAR | 50 | NO | - | - | - | Categoría: 'Decoracion', 'Catering', 'Musica', etc. |
| `precio_base` | DECIMAL | 8,2 | NO | - | - | - | Precio base del servicio |
| `unidad_medida` | VARCHAR | 20 | NO | - | - | - | Unidad: 'Por persona', 'Por evento', 'Por hora' |
| `registro_activo` | BOOLEAN | - | NO | - | - | - | Estado del registro |
| `fecha_creacion` | TIMESTAMP | - | NO | - | - | - | Fecha de creación |
| `fecha_modificacion` | TIMESTAMP | - | NO | - | - | - | Fecha de modificación |
| `usuario_creacion` | VARCHAR | 50 | NO | - | - | - | Usuario creador |
| `usuario_modificacion` | VARCHAR | 50 | SÍ | - | - | - | Usuario modificador |

**Restricciones:**
- `CHECK (categoria IN ('Decoracion', 'Catering', 'Musica', 'Fotografia', 'Entretenimiento', 'Logistica'))`
- `CHECK (unidad_medida IN ('Por persona', 'Por evento', 'Por hora'))`
- `CHECK (precio_base > 0)`
- `DEFAULT unidad_medida = 'Por evento'`

**Índices:**
- `idx_servicio_categoria` en `categoria`
- `idx_servicio_activo` en `registro_activo`

#### **Tabla: EVENTO**
**Propósito:** Eventos especiales planificados para clientes.

| **Campo** | **Tipo de Dato** | **Longitud** | **Nulos** | **PK** | **FK** | **Único** | **Descripción** |
|-----------|------------------|--------------|-----------|--------|--------|-----------|-----------------|
| `id_evento` | SERIAL | - | NO | ✅ | - | ✅ | Identificador único del evento |
| `id_cliente` | INTEGER | - | NO | - | ✅ | - | ID del cliente (cross-service) |
| `nombre_evento` | VARCHAR | 200 | NO | - | - | - | Nombre del evento |
| `tipo_evento` | VARCHAR | 50 | NO | - | - | - | Tipo: 'Cumpleaños', 'Matrimonio', etc. |
| `fecha_evento` | DATE | - | NO | - | - | - | Fecha del evento |
| `hora_inicio` | TIME | - | NO | - | - | - | Hora de inicio |
| `hora_fin` | TIME | - | NO | - | - | - | Hora de fin |
| `numero_invitados` | INTEGER | - | NO | - | - | - | Número de invitados |
| `estado` | VARCHAR | 20 | NO | - | - | - | Estado: 'Cotizacion', 'Confirmado', etc. |
| `presupuesto_estimado` | DECIMAL | 12,2 | NO | - | - | - | Presupuesto estimado |
| `monto_total` | DECIMAL | 12,2 | NO | - | - | - | Monto total final |
| `observaciones` | TEXT | - | SÍ | - | - | - | Observaciones del evento |
| `registro_activo` | BOOLEAN | - | NO | - | - | - | Estado del registro |
| `fecha_creacion` | TIMESTAMP | - | NO | - | - | - | Fecha de creación |
| `fecha_modificacion` | TIMESTAMP | - | NO | - | - | - | Fecha de modificación |
| `usuario_creacion` | VARCHAR | 50 | NO | - | - | - | Usuario creador |
| `usuario_modificacion` | VARCHAR | 50 | SÍ | - | - | - | Usuario modificador |

**Relaciones:**
- `id_cliente` → `cliente.id_cliente` (Cross-service reference)

**Restricciones:**
- `CHECK (tipo_evento IN ('Cumpleaños', 'Matrimonio', 'Corporativo', 'Graduacion', 'Aniversario', 'Otro'))`
- `CHECK (estado IN ('Cotizacion', 'Confirmado', 'Cancelado', 'Completado'))`
- `CHECK (numero_invitados > 0)`
- `CHECK (hora_fin > hora_inicio)`
- `DEFAULT estado = 'Cotizacion'`

**Índices:**
- `idx_evento_cliente` en `id_cliente`
- `idx_evento_fecha` en `fecha_evento`
- `idx_evento_tipo` en `tipo_evento`
- `idx_evento_estado` en `estado`

#### **Tabla: DETALLE_EVENTO**
**Propósito:** Servicios contratados para cada evento.

| **Campo** | **Tipo de Dato** | **Longitud** | **Nulos** | **PK** | **FK** | **Único** | **Descripción** |
|-----------|------------------|--------------|-----------|--------|--------|-----------|-----------------|
| `id_detalle_evento` | SERIAL | - | NO | ✅ | - | ✅ | Identificador único del detalle |
| `id_evento` | INTEGER | - | NO | - | ✅ | - | ID del evento |
| `id_servicio` | INTEGER | - | NO | - | ✅ | - | ID del servicio |
| `cantidad` | INTEGER | - | NO | - | - | - | Cantidad contratada |
| `precio_unitario` | DECIMAL | 8,2 | NO | - | - | - | Precio unitario del servicio |
| `subtotal` | DECIMAL | 10,2 | NO | - | - | - | Subtotal del servicio |
| `observaciones` | TEXT | - | SÍ | - | - | - | Observaciones específicas |
| `fecha_creacion` | TIMESTAMP | - | NO | - | - | - | Fecha de creación |
| `usuario_creacion` | VARCHAR | 50 | NO | - | - | - | Usuario creador |

**Relaciones:**
- `id_evento` → `evento.id_evento` (FK)
- `id_servicio` → `servicio.id_servicio` (FK)

**Restricciones:**
- `CHECK (cantidad > 0)`
- `CHECK (precio_unitario > 0)`
- `CHECK (subtotal > 0)`

**Índices:**
- `idx_detalle_evento` en `id_evento`
- `idx_detalle_servicio` en `id_servicio`

#### **Tabla: PAGO_EVENTO**
**Propósito:** Pagos realizados para eventos especiales.

| **Campo** | **Tipo de Dato** | **Longitud** | **Nulos** | **PK** | **FK** | **Único** | **Descripción** |
|-----------|------------------|--------------|-----------|--------|--------|-----------|-----------------|
| `id_pago_evento` | SERIAL | - | NO | ✅ | - | ✅ | Identificador único del pago |
| `id_evento` | INTEGER | - | NO | - | ✅ | - | ID del evento |
| `codigo_transaccion` | VARCHAR | 100 | NO | - | - | ✅ | Código único de transacción |
| `monto` | DECIMAL | 10,2 | NO | - | - | - | Monto del pago |
| `metodo_pago` | VARCHAR | 50 | NO | - | - | - | Método de pago |
| `estado_pago` | VARCHAR | 20 | NO | - | - | - | Estado del pago |
| `tipo_pago` | VARCHAR | 20 | NO | - | - | - | Tipo: 'Adelanto', 'Total', 'Complemento' |
| `fecha_pago` | TIMESTAMP | - | NO | - | - | - | Fecha del pago |
| `fecha_creacion` | TIMESTAMP | - | NO | - | - | - | Fecha de creación |
| `usuario_creacion` | VARCHAR | 50 | NO | - | - | - | Usuario creador |

**Relaciones:**
- `id_evento` → `evento.id_evento` (FK)

**Restricciones:**
- `CHECK (monto > 0)`
- `CHECK (tipo_pago IN ('Adelanto', 'Total', 'Complemento'))`
- `DEFAULT estado_pago = 'Pendiente'`
- `DEFAULT tipo_pago = 'Total'`

**Índices:**
- `idx_pago_evento` en `id_evento`

---

## 📊 **VISTAS DEL SISTEMA**

### **v_reservas_completas**
**Propósito:** Vista consolidada de reservas con información de mesas.

| **Campo** | **Tipo** | **Origen** | **Descripción** |
|-----------|----------|------------|-----------------|
| `id_reserva` | INTEGER | reserva | ID de la reserva |
| `fecha_reserva` | DATE | reserva | Fecha de la reserva |
| `hora_inicio` | TIME | reserva | Hora de inicio |
| `hora_fin` | TIME | reserva | Hora de fin |
| `numero_personas` | INTEGER | reserva | Número de personas |
| `estado` | VARCHAR | reserva | Estado de la reserva |
| `monto_total` | DECIMAL | reserva | Monto total |
| `numero_mesa` | INTEGER | mesa | Número de mesa |
| `ubicacion_mesa` | VARCHAR | mesa | Ubicación de la mesa |
| `id_cliente` | INTEGER | reserva | ID del cliente |
| `observaciones` | TEXT | reserva | Observaciones |

### **v_productos_populares**
**Propósito:** Vista de productos más vendidos y estadísticas.

| **Campo** | **Tipo** | **Descripción** |
|-----------|----------|-----------------|
| `id_producto` | INTEGER | ID del producto |
| `total_vendido` | BIGINT | Cantidad total vendida |
| `veces_ordenado` | BIGINT | Número de veces ordenado |
| `precio_promedio` | DECIMAL | Precio promedio |

---

## 🔧 **FUNCIONES Y TRIGGERS**

### **actualizar_fecha_modificacion()**
**Propósito:** Actualiza automáticamente el campo `fecha_modificacion` antes de cada UPDATE.

**Aplicado en:**
- Todas las tablas principales con campo `fecha_modificacion`

**Código:**
```sql
CREATE OR REPLACE FUNCTION actualizar_fecha_modificacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_modificacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 🔗 **RELACIONES ENTRE MICROSERVICIOS**

### **Cross-Service References:**

1. **cliente.email** ↔ **usuario.email**
   - Tipo: Referencia lógica
   - Propósito: Vinculación entre autenticación y perfil

2. **reserva.id_cliente** ↔ **cliente.id_cliente**
   - Tipo: Referencia cross-service
   - Propósito: Reservas por cliente

3. **detalle_reserva.id_producto** ↔ **producto.id_producto**
   - Tipo: Referencia cross-service
   - Propósito: Productos en reservas

4. **pago.id_reserva** ↔ **reserva.id_reserva**
   - Tipo: Referencia cross-service
   - Propósito: Pagos de reservas

5. **evento.id_cliente** ↔ **cliente.id_cliente**
   - Tipo: Referencia cross-service
   - Propósito: Eventos por cliente

---

## 📈 **ESTADÍSTICAS DE LA BASE DE DATOS**

| **Métrica** | **Valor** |
|-------------|-----------|
| **Total de Tablas** | 11 |
| **Total de Campos** | 125+ |
| **Total de Índices** | 24+ |
| **Total de Restricciones** | 35+ |
| **Microservicios** | 5 |
| **Vistas** | 2 |
| **Funciones** | 1 |
| **Triggers** | 11+ |

---

## 🛡️ **CONSIDERACIONES DE SEGURIDAD**

1. **Encriptación:**
   - Contraseñas con BCrypt
   - Comunicación HTTPS

2. **Validaciones:**
   - Constraints en base de datos
   - Validaciones en aplicación

3. **Auditoría:**
   - Campos de trazabilidad
   - Logs de modificaciones

4. **Acceso:**
   - Roles específicos por microservicio
   - Principio de menor privilegio

---

## 📝 **NOTAS TÉCNICAS**

- **Versión de PostgreSQL:** 14+
- **Codificación:** UTF-8
- **Timezone:** UTC
- **Backup:** Automático diario
- **Replicación:** En tiempo real
- **Monitoreo:** Métricas de performance habilitadas

---

*Documento generado el: Noviembre 2025*  
*Versión: 1.0*  
*Sistema: Marakos Grill - Microservicios*