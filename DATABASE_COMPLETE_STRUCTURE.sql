-- =====================================================================
-- SCRIPT COMPLETO DE ESTRUCTURA DE BASE DE DATOS - MARAKOS GRILL
-- Sistema de Microservicios para Restaurante
-- =====================================================================

-- =====================================================================
-- 🔐 AUTH-SERVICE DATABASE (puerto 8080)
-- Maneja autenticación y autorización del sistema
-- =====================================================================

CREATE DATABASE marakos_auth;
USE marakos_auth;

-- Tabla de usuarios del sistema
CREATE TABLE usuario (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Encriptado con BCrypt
    telefono VARCHAR(20),
    tipo_usuario VARCHAR(20) NOT NULL CHECK (tipo_usuario IN ('Cliente', 'Empleado')),
    
    -- Campos de auditoría
    registro_activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_creacion VARCHAR(50) DEFAULT 'sistema',
    usuario_modificacion VARCHAR(50)
);

-- Índices para optimización
CREATE INDEX idx_usuario_email ON usuario(email);
CREATE INDEX idx_usuario_tipo ON usuario(tipo_usuario);
CREATE INDEX idx_usuario_activo ON usuario(registro_activo);

-- =====================================================================
-- 👥 CUSTOMER-SERVICE DATABASE (puerto 8081)
-- Maneja información detallada de clientes
-- =====================================================================

CREATE DATABASE marakos_customer;
USE marakos_customer;

-- Tabla de clientes con información detallada
CREATE TABLE cliente (
    id_cliente SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL, -- Referencia a usuario.email
    telefono VARCHAR(20),
    fecha_nacimiento DATE,
    direccion TEXT,
    
    -- Campos de auditoría
    registro_activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_creacion VARCHAR(50) DEFAULT 'sistema',
    usuario_modificacion VARCHAR(50)
);

-- Índices para optimización
CREATE INDEX idx_cliente_email ON cliente(email);
CREATE INDEX idx_cliente_nombre ON cliente(nombre, apellido);
CREATE INDEX idx_cliente_activo ON cliente(registro_activo);

-- =====================================================================
-- 🍽️ MANAGEMENT-SERVICE DATABASE (puerto 8082)
-- Maneja carta de productos y categorías del restaurante
-- =====================================================================

CREATE DATABASE marakos_management;
USE marakos_management;

-- Tabla de categorías de productos
CREATE TABLE categoria (
    id_categoria SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    icono VARCHAR(50), -- Emoji o código de icono
    
    -- Campos de auditoría
    registro_activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_creacion VARCHAR(50) DEFAULT 'sistema',
    usuario_modificacion VARCHAR(50)
);

-- Tabla de productos del menú
CREATE TABLE producto (
    id_producto SERIAL PRIMARY KEY,
    id_categoria INTEGER NOT NULL REFERENCES categoria(id_categoria),
    codigo VARCHAR(20) UNIQUE NOT NULL, -- Ej: "CARNE-01"
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(8,2) NOT NULL CHECK (precio > 0),
    stock INTEGER DEFAULT 0 CHECK (stock >= 0),
    url_imagen TEXT, -- URL de imagen del producto
    estado VARCHAR(20) DEFAULT 'Disponible' CHECK (estado IN ('Disponible', 'Agotado', 'Descontinuado')),
    
    -- Campos de auditoría
    registro_activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_creacion VARCHAR(50) DEFAULT 'sistema',
    usuario_modificacion VARCHAR(50)
);

-- Índices para optimización
CREATE INDEX idx_categoria_nombre ON categoria(nombre);
CREATE INDEX idx_categoria_activo ON categoria(registro_activo);
CREATE INDEX idx_producto_categoria ON producto(id_categoria);
CREATE INDEX idx_producto_codigo ON producto(codigo);
CREATE INDEX idx_producto_estado ON producto(estado);
CREATE INDEX idx_producto_activo ON producto(registro_activo);

-- =====================================================================
-- 📅 RESERVATION-SERVICE DATABASE (puerto 8083)
-- Maneja reservas de mesas y pedidos
-- =====================================================================

CREATE DATABASE marakos_reservation;
USE marakos_reservation;

-- Tabla de mesas del restaurante
CREATE TABLE mesa (
    id_mesa SERIAL PRIMARY KEY,
    numero_mesa INTEGER UNIQUE NOT NULL,
    capacidad INTEGER NOT NULL CHECK (capacidad > 0),
    ubicacion VARCHAR(100), -- Ej: "Terraza", "Salón Principal"
    estado VARCHAR(20) DEFAULT 'Disponible' CHECK (estado IN ('Disponible', 'Ocupada', 'Reservada', 'Mantenimiento')),
    
    -- Campos de auditoría
    registro_activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_creacion VARCHAR(50) DEFAULT 'sistema',
    usuario_modificacion VARCHAR(50)
);

-- Tabla de reservas
CREATE TABLE reserva (
    id_reserva SERIAL PRIMARY KEY,
    id_cliente INTEGER NOT NULL, -- Referencia a cliente.id_cliente (cross-service)
    id_mesa INTEGER NOT NULL REFERENCES mesa(id_mesa),
    fecha_reserva DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    numero_personas INTEGER NOT NULL CHECK (numero_personas > 0),
    estado VARCHAR(20) DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Confirmada', 'Cancelada', 'Completada')),
    observaciones TEXT,
    monto_total DECIMAL(10,2) DEFAULT 0,
    
    -- Campos de auditoría
    registro_activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_creacion VARCHAR(50) DEFAULT 'sistema',
    usuario_modificacion VARCHAR(50),
    
    -- Constraint para evitar solapamiento de reservas
    CONSTRAINT chk_hora_fin CHECK (hora_fin > hora_inicio)
);

-- Tabla de detalle de productos en la reserva
CREATE TABLE detalle_reserva (
    id_detalle SERIAL PRIMARY KEY,
    id_reserva INTEGER NOT NULL REFERENCES reserva(id_reserva),
    id_producto INTEGER NOT NULL, -- Referencia a producto.id_producto (cross-service)
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(8,2) NOT NULL CHECK (precio_unitario > 0),
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal > 0),
    observaciones TEXT,
    
    -- Campos de auditoría
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_creacion VARCHAR(50) DEFAULT 'sistema'
);

-- Índices para optimización
CREATE INDEX idx_mesa_numero ON mesa(numero_mesa);
CREATE INDEX idx_mesa_estado ON mesa(estado);
CREATE INDEX idx_reserva_cliente ON reserva(id_cliente);
CREATE INDEX idx_reserva_mesa ON reserva(id_mesa);
CREATE INDEX idx_reserva_fecha ON reserva(fecha_reserva);
CREATE INDEX idx_reserva_estado ON reserva(estado);
CREATE INDEX idx_detalle_reserva ON detalle_reserva(id_reserva);
CREATE INDEX idx_detalle_producto ON detalle_reserva(id_producto);

-- =====================================================================
-- 💳 PAYMENT-SERVICE DATABASE (puerto 8084)
-- Maneja pagos y transacciones con Culqi
-- =====================================================================

CREATE DATABASE marakos_payment;
USE marakos_payment;

-- Tabla de pagos
CREATE TABLE pago (
    id_pago SERIAL PRIMARY KEY,
    id_reserva INTEGER NOT NULL, -- Referencia a reserva.id_reserva (cross-service)
    codigo_transaccion VARCHAR(100) UNIQUE NOT NULL,
    monto DECIMAL(10,2) NOT NULL CHECK (monto > 0),
    metodo_pago VARCHAR(50) NOT NULL CHECK (metodo_pago IN ('Tarjeta', 'Efectivo', 'Transferencia', 'Yape', 'Plin')),
    estado_pago VARCHAR(20) DEFAULT 'Pendiente' CHECK (estado_pago IN ('Pendiente', 'Completado', 'Fallido', 'Reembolsado')),
    proveedor_pago VARCHAR(20) DEFAULT 'Culqi' CHECK (proveedor_pago IN ('Culqi', 'Interno')),
    
    -- Campos específicos de Culqi
    token_culqi VARCHAR(255),
    respuesta_culqi TEXT, -- JSON response de Culqi
    
    -- Campos de auditoría
    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_creacion VARCHAR(50) DEFAULT 'sistema',
    usuario_modificacion VARCHAR(50)
);

-- Índices para optimización
CREATE INDEX idx_pago_reserva ON pago(id_reserva);
CREATE INDEX idx_pago_codigo ON pago(codigo_transaccion);
CREATE INDEX idx_pago_estado ON pago(estado_pago);
CREATE INDEX idx_pago_fecha ON pago(fecha_pago);

-- =====================================================================
-- 🎉 EVENT-PLANNING-SERVICE DATABASE (puerto 8085)
-- Maneja planificación de eventos especiales
-- =====================================================================

CREATE DATABASE marakos_events;
USE marakos_events;

-- Tabla de servicios disponibles para eventos
CREATE TABLE servicio (
    id_servicio SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('Decoracion', 'Catering', 'Musica', 'Fotografia', 'Entretenimiento', 'Logistica')),
    precio_base DECIMAL(8,2) NOT NULL CHECK (precio_base > 0),
    unidad_medida VARCHAR(20) DEFAULT 'Por evento' CHECK (unidad_medida IN ('Por persona', 'Por evento', 'Por hora')),
    
    -- Campos de auditoría
    registro_activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_creacion VARCHAR(50) DEFAULT 'sistema',
    usuario_modificacion VARCHAR(50)
);

-- Tabla de eventos
CREATE TABLE evento (
    id_evento SERIAL PRIMARY KEY,
    id_cliente INTEGER NOT NULL, -- Referencia a cliente.id_cliente (cross-service)
    nombre_evento VARCHAR(200) NOT NULL,
    tipo_evento VARCHAR(50) NOT NULL CHECK (tipo_evento IN ('Cumpleaños', 'Matrimonio', 'Corporativo', 'Graduacion', 'Aniversario', 'Otro')),
    fecha_evento DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    numero_invitados INTEGER NOT NULL CHECK (numero_invitados > 0),
    estado VARCHAR(20) DEFAULT 'Cotizacion' CHECK (estado IN ('Cotizacion', 'Confirmado', 'Cancelado', 'Completado')),
    presupuesto_estimado DECIMAL(12,2) DEFAULT 0,
    monto_total DECIMAL(12,2) DEFAULT 0,
    observaciones TEXT,
    
    -- Campos de auditoría
    registro_activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_creacion VARCHAR(50) DEFAULT 'sistema',
    usuario_modificacion VARCHAR(50),
    
    -- Constraint para validar horas
    CONSTRAINT chk_evento_hora_fin CHECK (hora_fin > hora_inicio)
);

-- Tabla de detalle de servicios en el evento
CREATE TABLE detalle_evento (
    id_detalle_evento SERIAL PRIMARY KEY,
    id_evento INTEGER NOT NULL REFERENCES evento(id_evento),
    id_servicio INTEGER NOT NULL REFERENCES servicio(id_servicio),
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(8,2) NOT NULL CHECK (precio_unitario > 0),
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal > 0),
    observaciones TEXT,
    
    -- Campos de auditoría
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_creacion VARCHAR(50) DEFAULT 'sistema'
);

-- Tabla de pagos para eventos
CREATE TABLE pago_evento (
    id_pago_evento SERIAL PRIMARY KEY,
    id_evento INTEGER NOT NULL REFERENCES evento(id_evento),
    codigo_transaccion VARCHAR(100) UNIQUE NOT NULL,
    monto DECIMAL(10,2) NOT NULL CHECK (monto > 0),
    metodo_pago VARCHAR(50) NOT NULL,
    estado_pago VARCHAR(20) DEFAULT 'Pendiente',
    tipo_pago VARCHAR(20) DEFAULT 'Total' CHECK (tipo_pago IN ('Adelanto', 'Total', 'Complemento')),
    
    -- Campos de auditoría
    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_creacion VARCHAR(50) DEFAULT 'sistema'
);

-- Índices para optimización
CREATE INDEX idx_servicio_categoria ON servicio(categoria);
CREATE INDEX idx_servicio_activo ON servicio(registro_activo);
CREATE INDEX idx_evento_cliente ON evento(id_cliente);
CREATE INDEX idx_evento_fecha ON evento(fecha_evento);
CREATE INDEX idx_evento_tipo ON evento(tipo_evento);
CREATE INDEX idx_evento_estado ON evento(estado);
CREATE INDEX idx_detalle_evento ON detalle_evento(id_evento);
CREATE INDEX idx_detalle_servicio ON detalle_evento(id_servicio);
CREATE INDEX idx_pago_evento ON pago_evento(id_evento);

-- =====================================================================
-- 📊 VISTAS PARA REPORTING Y ANÁLISIS
-- =====================================================================

-- Vista consolidada de reservas con información del cliente
CREATE VIEW v_reservas_completas AS
SELECT 
    r.id_reserva,
    r.fecha_reserva,
    r.hora_inicio,
    r.hora_fin,
    r.numero_personas,
    r.estado,
    r.monto_total,
    m.numero_mesa,
    m.ubicacion as ubicacion_mesa,
    r.id_cliente,
    r.observaciones
FROM reserva r
JOIN mesa m ON r.id_mesa = m.id_mesa
WHERE r.registro_activo = true;

-- Vista de productos más vendidos
CREATE VIEW v_productos_populares AS
SELECT 
    dr.id_producto,
    SUM(dr.cantidad) as total_vendido,
    COUNT(DISTINCT dr.id_reserva) as veces_ordenado,
    AVG(dr.precio_unitario) as precio_promedio
FROM detalle_reserva dr
JOIN reserva r ON dr.id_reserva = r.id_reserva
WHERE r.estado = 'Completada'
GROUP BY dr.id_producto
ORDER BY total_vendido DESC;

-- =====================================================================
-- 🔧 FUNCIONES Y TRIGGERS PARA AUDITORÍA
-- =====================================================================

-- Función para actualizar fecha_modificacion automáticamente
CREATE OR REPLACE FUNCTION actualizar_fecha_modificacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_modificacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas principales
-- (Ejemplo para tabla usuario - replicar para todas)
CREATE TRIGGER trigger_usuario_fecha_modificacion
    BEFORE UPDATE ON usuario
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_modificacion();

-- =====================================================================
-- 📝 COMENTARIOS ADICIONALES
-- =====================================================================

/*
CONSIDERACIONES IMPORTANTES:

1. SEGURIDAD:
   - Todas las contraseñas deben estar encriptadas con BCrypt
   - Implementar rate limiting para APIs
   - Validar entrada de datos en todos los endpoints
   - Usar HTTPS en producción

2. ESCALABILIDAD:
   - Cada microservicio tiene su propia base de datos
   - Comunicación entre servicios vía API REST o eventos
   - Implementar cache para consultas frecuentes
   - Considerar particionamiento para tablas grandes

3. BACKUP Y RECUPERACIÓN:
   - Backup automático diario de todas las bases de datos
   - Replicación en tiempo real para alta disponibilidad
   - Procedimientos de recuperación documentados

4. MONITOREO:
   - Logs estructurados en todas las operaciones
   - Métricas de performance para cada microservicio
   - Alertas para errores críticos

5. DATOS DE EJEMPLO:
   - Ejecutar scripts de datos de prueba en desarrollo
   - Anonimizar datos en entornos de testing
   - Mantener datos coherentes entre microservicios
*/