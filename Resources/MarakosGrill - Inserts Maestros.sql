
-- Insertar tipo de usuario: Cliente
INSERT INTO tipo_usuario (nombre, descripcion, id_usuario_creacion) 
VALUES ('Cliente', 'Usuario que realiza reservas y consume servicios del restaurante',  1);

-- Insertar tipo de usuario: Empleado
INSERT INTO tipo_usuario (nombre, descripcion, id_usuario_creacion) 
VALUES ('Empleado', 'Usuario que gestiona operaciones internas y atención al cliente', 1);

-- SELECT * FROM tipo_usuario;


INSERT INTO usuario (id_tipo_usuario, email, contrasena, estado, id_usuario_creacion) 
VALUES (2, 'admin@restaurante.com', 'admin123', 'ACTIVO', 1);

INSERT INTO usuario (id_tipo_usuario, email, contrasena, estado, id_usuario_creacion) 
VALUES (2, 'recepcion@restaurante.com', 'recep123', 'ACTIVO', 1);

INSERT INTO usuario (id_tipo_usuario, email, contrasena, estado, id_usuario_creacion) 
VALUES (2, 'moso@restaurante.com', 'moso123', 'ACTIVO', 1);

INSERT INTO usuario (id_tipo_usuario, email, contrasena, estado, id_usuario_creacion) 
VALUES (1, 'cliente1@mail.com', 'cliente123', 'ACTIVO', 1);

INSERT INTO usuario (id_tipo_usuario, email, contrasena, estado, id_usuario_creacion) 
VALUES (1, 'cliente2@mail.com', 'cliente456', 'ACTIVO', 1);

-- SELECT * FROM usuario;


INSERT INTO rol (nombre, descripcion, id_usuario_creacion) 
VALUES ('Administrador', 'Rol con acceso total al sistema', 1);

INSERT INTO rol (nombre, descripcion, id_usuario_creacion) 
VALUES ('Recepcionista', 'Rol encargado de gestionar reservas y atención al cliente', 1);

INSERT INTO rol (nombre, descripcion, id_usuario_creacion) 
VALUES ('Moso', 'Rol responsable de atención en mesa y seguimiento de pedidos', 1);

-- SELECT * FROM rol;


INSERT INTO empleado (id_usuario, nombre, apellido, telefono, id_rol, turno_laboral, fecha_ingreso, estado_laboral, id_usuario_creacion) 
VALUES (1, 'Luis', 'Ramírez', '987654321', 1, 1, '2025-10-11', 'ACTIVO', 1);

INSERT INTO empleado (id_usuario, nombre, apellido, telefono, id_rol, turno_laboral, fecha_ingreso, estado_laboral, id_usuario_creacion) 
VALUES (2, 'María', 'Fernández', '912345678', 2, 2, '2025-10-11', 'ACTIVO', 1);

INSERT INTO empleado (id_usuario, nombre, apellido, telefono, id_rol, turno_laboral, fecha_ingreso, estado_laboral, id_usuario_creacion) 
VALUES (3, 'Carlos', 'Gómez', '956789012', 3, 3, '2025-10-11', 'ACTIVO', 1);

-- SELECT * FROM empleado;


INSERT INTO cliente (id_usuario, nombre, apellido, telefono, foto, fecha_nacimiento, documento_identidad, entidad_financiera, cuenta_rembolso, estado, id_usuario_creacion) 
VALUES (4, 'Javier', 'Paredes', '987112233', 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png', '1990-05-12', '12345678', 'BBVA', 'CTA001', 'ACTIVO', 1);

INSERT INTO cliente (id_usuario, nombre, apellido, telefono, foto, fecha_nacimiento, documento_identidad, entidad_financiera, cuenta_rembolso, estado, id_usuario_creacion) 
VALUES (5, 'Lucía', 'Torres', '912334455', 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png', '1988-11-30', '87654321', 'BCP', 'CTA002', 'ACTIVO', 1);

-- SELECT * FROM cliente;


INSERT INTO mesa (codigo, capacidad, ubicacion, estado, id_usuario_creacion) 
VALUES ('MESA-01', 4, 'Zona central', 'DISPONIBLE', 1);

INSERT INTO mesa (codigo, capacidad, ubicacion, estado, id_usuario_creacion) 
VALUES ('MESA-02', 2, 'Terraza', 'DISPONIBLE', 1);

INSERT INTO mesa (codigo, capacidad, ubicacion, estado, id_usuario_creacion) 
VALUES ('MESA-03', 6, 'Salón privado', 'DISPONIBLE', 1);

INSERT INTO mesa (codigo, capacidad, ubicacion, estado, id_usuario_creacion) 
VALUES ('MESA-04', 4, 'Cerca a ventana', 'DISPONIBLE', 1);

INSERT INTO mesa (codigo, capacidad, ubicacion, estado, id_usuario_creacion) 
VALUES ('MESA-05', 8, 'Zona fumadores', 'DISPONIBLE', 1);

-- SELECT * FROM mesa;


-- Categorías de platos a la parrilla
INSERT INTO categoria (nombre, descripcion, id_usuario_creacion) 
VALUES ('Carnes a la parrilla', 'Cortes de res, cerdo y pollo preparados a la brasa', 1);

INSERT INTO categoria (nombre, descripcion, id_usuario_creacion) 
VALUES ('Anticuchos', 'Corazón de res y otras variedades servidas en brochetas', 1);

INSERT INTO categoria (nombre, descripcion, id_usuario_creacion) 
VALUES ('Chorizos y embutidos', 'Chorizos artesanales, morcillas y salchichas parrilleras', 1);

INSERT INTO categoria (nombre, descripcion, id_usuario_creacion) 
VALUES ('Guarniciones', 'Papas, yucas, ensaladas y otros acompañamientos típicos', 1);

INSERT INTO categoria (nombre, descripcion, id_usuario_creacion) 
VALUES ('Salsas y cremas', 'Ajíes, huancaína, chimichurri y otras salsas peruanas', 1);

-- Categorías de combos
INSERT INTO categoria (nombre, descripcion, id_usuario_creacion) 
VALUES ('Combo parrillero clásico', 'Conjunto de carnes, guarniciones y bebida para compartir', 1);

INSERT INTO categoria (nombre, descripcion, id_usuario_creacion) 
VALUES ('Combo familiar peruano', 'Selección de platos típicos peruanos en formato familiar', 1);

-- SELECT * FROM categoria;


--🥩 Carnes a la parrilla (id_categoria = 1)
INSERT INTO producto (codigo, nombre, descripción, precio, id_categoria, stock, estado, id_usuario_creacion) 
VALUES ('CARNE-01', 'Bife de chorizo', 'Corte grueso de res a la parrilla', 35.00, 1, 20, 'DISPONIBLE', 1);

INSERT INTO producto (codigo, nombre, descripción, precio, id_categoria, stock, estado, id_usuario_creacion) 
VALUES ('CARNE-02', 'Costillas BBQ', 'Costillas de cerdo con salsa barbacoa', 32.00, 1, 15, 'DISPONIBLE', 1);

INSERT INTO producto (codigo, nombre, descripción, precio, id_categoria, stock, estado, id_usuario_creacion) 
VALUES ('CARNE-03', 'Pollo a la brasa', 'Medio pollo marinado y asado', 28.00, 1, 25, 'DISPONIBLE', 1);

INSERT INTO producto (codigo, nombre, descripción, precio, id_categoria, stock, estado, id_usuario_creacion) 
VALUES ('CARNE-04', 'Pechuga grillada', 'Pechuga de pollo con especias peruanas', 26.00, 1, 18, 'DISPONIBLE', 1);

INSERT INTO producto (codigo, nombre, descripción, precio, id_categoria, stock, estado, id_usuario_creacion) 
VALUES ('CARNE-05', 'Picanha', 'Corte brasileño de res con sal gruesa', 38.00, 1, 12, 'DISPONIBLE', 1);

--🔥 Anticuchos (id_categoria = 2)
INSERT INTO producto (codigo, nombre, descripción, precio, id_categoria, stock, estado, id_usuario_creacion) 
VALUES ('ANTI-01', 'Anticucho de corazón', 'Brochetas de corazón de res con papa dorada', 18.00, 2, 30, 'DISPONIBLE', 1);

INSERT INTO producto (codigo, nombre, descripción, precio, id_categoria, stock, estado, id_usuario_creacion) 
VALUES ('ANTI-02', 'Anticucho de pollo', 'Brochetas de pollo con ají panca', 16.00, 2, 25, 'DISPONIBLE', 1);

INSERT INTO producto (codigo, nombre, descripción, precio, id_categoria, stock, estado, id_usuario_creacion) 
VALUES ('ANTI-03', 'Anticucho mixto', 'Combinación de corazón, pollo y chorizo', 22.00, 2, 20, 'DISPONIBLE', 1);

INSERT INTO producto (codigo, nombre, descripción, precio, id_categoria, stock, estado, id_usuario_creacion) 
VALUES ('ANTI-04', 'Anticucho de champiñones', 'Opción vegetariana con salsa anticuchera', 15.00, 2, 10, 'DISPONIBLE', 1);

INSERT INTO producto (codigo, nombre, descripción, precio, id_categoria, stock, estado, id_usuario_creacion) 
VALUES ('ANTI-05', 'Anticucho de cerdo', 'Brochetas de cerdo con papas nativas', 17.00, 2, 15, 'DISPONIBLE', 1);

--🌭 Chorizos y embutidos (id_categoria = 3)
INSERT INTO producto (codigo, nombre, descripción, precio, id_categoria, stock, estado, id_usuario_creacion) 
VALUES ('CHOR-01', 'Chorizo parrillero', 'Chorizo artesanal cocido a la brasa', 14.00, 3, 25, 'DISPONIBLE', 1);

INSERT INTO producto (codigo, nombre, descripción, precio, id_categoria, stock, estado, id_usuario_creacion) 
VALUES ('CHOR-02', 'Morcilla', 'Embutido de sangre con arroz y especias', 13.00, 3, 20, 'DISPONIBLE', 1);

INSERT INTO producto (codigo, nombre, descripción, precio, id_categoria, stock, estado, id_usuario_creacion) 
VALUES ('CHOR-03', 'Salchicha huachana', 'Salchicha típica de Huacho, ligeramente picante', 15.00, 3, 18, 'DISPONIBLE', 1);

INSERT INTO producto (codigo, nombre, descripción, precio, id_categoria, stock, estado, id_usuario_creacion) 
VALUES ('CHOR-04', 'Chorizo picante', 'Chorizo rojo con ají especial', 14.50, 3, 22, 'DISPONIBLE', 1);

INSERT INTO producto (codigo, nombre, descripción, precio, id_categoria, stock, estado, id_usuario_creacion) 
VALUES ('CHOR-05', 'Chorizo de pollo', 'Opción ligera con especias peruanas', 13.50, 3, 15, 'DISPONIBLE', 1);

--🍟 Guarniciones (id_categoria = 4)
INSERT INTO producto (codigo, nombre, descripción, precio, id_categoria, stock, estado, id_usuario_creacion) 
VALUES ('GUAR-01', 'Papas doradas', 'Papas amarillas crocantes con sal de Maras', 9.00, 4, 40, 'DISPONIBLE', 1);

INSERT INTO producto (codigo, nombre, descripción, precio, id_categoria, stock, estado, id_usuario_creacion) 
VALUES ('GUAR-02', 'Yuca frita', 'Yuca crocante con salsa huancaína', 9.50, 4, 35, 'DISPONIBLE', 1);

INSERT INTO producto (codigo, nombre, descripción, precio, id_categoria, stock, estado, id_usuario_creacion) 
VALUES ('GUAR-03', 'Ensalada criolla', 'Tomate, cebolla, limón y perejil fresco', 8.00, 4, 30, 'DISPONIBLE', 1);

INSERT INTO producto (codigo, nombre, descripción, precio, id_categoria, stock, estado, id_usuario_creacion) 
VALUES ('GUAR-04', 'Choclo con queso', 'Choclo serrano con queso fresco', 10.00, 4, 25, 'DISPONIBLE', 1);

INSERT INTO producto (codigo, nombre, descripción, precio, id_categoria, stock, estado, id_usuario_creacion) 
VALUES ('GUAR-05', 'Plátano frito', 'Plátano maduro crocante', 8.50, 4, 20, 'DISPONIBLE', 1);

--🧂 Salsas y cremas (id_categoria = 5)
INSERT INTO producto (codigo, nombre, descripción, precio, id_categoria, stock, estado, id_usuario_creacion) 
VALUES ('SALSA-01', 'Ají amarillo', 'Salsa cremosa de ají amarillo', 3.00, 5, 50, 'DISPONIBLE', 1);

INSERT INTO producto (codigo, nombre, descripción, precio, id_categoria, stock, estado, id_usuario_creacion) 
VALUES ('SALSA-02', 'Huancaína', 'Salsa de queso y ají amarillo', 3.50, 5, 45, 'DISPONIBLE', 1);

INSERT INTO producto (codigo, nombre, descripción, precio, id_categoria, stock, estado, id_usuario_creacion) 
VALUES ('SALSA-03', 'Chimichurri', 'Salsa verde con perejil, ajo y vinagre', 3.00, 5, 40, 'DISPONIBLE', 1);

INSERT INTO producto (codigo, nombre, descripción, precio, id_categoria, stock, estado, id_usuario_creacion) 
VALUES ('SALSA-04', 'Rocoto', 'Salsa picante de rocoto molido', 3.50, 5, 35, 'DISPONIBLE', 1);

INSERT INTO producto (codigo, nombre, descripción, precio, id_categoria, stock, estado, id_usuario_creacion) 
VALUES ('SALSA-05', 'Mayonesa de ajo', 'Mayonesa casera con ajo peruano', 3.00, 5, 30, 'DISPONIBLE', 1);

--🍽️ Combos (id_categoria = 6 y 7)
INSERT INTO producto (codigo, nombre, descripción, precio, id_categoria, stock, estado, id_usuario_creacion) 
VALUES ('COMBO-01', 'Combo parrillero clásico', 'Incluye bife de chorizo, chorizo parrillero, papas doradas y bebida', 75.00, 6, 10, 'DISPONIBLE', 1);

INSERT INTO producto (codigo, nombre, descripción, precio, id_categoria, stock, estado, id_usuario_creacion) 
VALUES ('COMBO-02', 'Combo familiar peruano', 'Anticuchos mixtos, pollo a la brasa, yuca frita, ensalada criolla y bebida para 4 personas', 120.00, 7, 8, 'DISPONIBLE', 1);

-- SELECT * FROM producto;


/*INSERT INTO servicio (nombre, descripcion, unidad_medida, precio, estado, id_usuario_creacion) 
VALUES ('Servicio de mozos', 'Atención personalizada en mesa durante el evento', 'persona', 80.00, 'DISPONIBLE', 1);

INSERT INTO servicio (nombre, descripcion, unidad_medida, precio, estado, id_usuario_creacion) 
VALUES ('Servicio de bartender', 'Preparación de cócteles y bebidas en barra', 'persona', 120.00, 'DISPONIBLE', 1);

INSERT INTO servicio (nombre, descripcion, unidad_medida, precio, estado, id_usuario_creacion) 
VALUES ('DJ para eventos', 'Música en vivo y animación durante el evento', 'evento', 350.00, 'DISPONIBLE', 1);

INSERT INTO servicio (nombre, descripcion, unidad_medida, precio, estado, id_usuario_creacion) 
VALUES ('Decoración temática', 'Ambientación personalizada según tipo de evento', 'evento', 250.00, 'DISPONIBLE', 1);

INSERT INTO servicio (nombre, descripcion, unidad_medida, precio, estado, id_usuario_creacion) 
VALUES ('Servicio de limpieza post-evento', 'Limpieza completa del salón y áreas utilizadas', 'evento', 180.00, 'DISPONIBLE', 1);

INSERT INTO servicio (nombre, descripcion, unidad_medida, precio, estado, id_usuario_creacion) 
VALUES ('Animador infantil', 'Entretenimiento para niños durante el evento', 'persona', 200.00, 'DISPONIBLE', 1);

INSERT INTO servicio (nombre, descripcion, unidad_medida, precio, estado, id_usuario_creacion) 
VALUES ('Fotografía profesional', 'Cobertura fotográfica del evento completo', 'evento', 400.00, 'DISPONIBLE', 1);

INSERT INTO servicio (nombre, descripcion, unidad_medida, precio, estado, id_usuario_creacion) 
VALUES ('Proyector y pantalla', 'Equipo audiovisual para presentaciones o videos', 'evento', 150.00, 'DISPONIBLE', 1);

INSERT INTO servicio (nombre, descripcion, unidad_medida, precio, estado, id_usuario_creacion) 
VALUES ('Servicio de seguridad', 'Personal de seguridad para control de acceso y orden', 'persona', 100.00, 'DISPONIBLE', 1);

INSERT INTO servicio (nombre, descripcion, unidad_medida, precio, estado, id_usuario_creacion) 
VALUES ('Mesa de dulces', 'Montaje de mesa con variedad de postres y decoración', 'evento', 220.00, 'DISPONIBLE', 1);*/
--===

INSERT INTO servicio (nombre, descripcion, unidad_medida, precio, tipo_servicio, estado, id_usuario_creacion)
VALUES ('Servicio de mozos', 'Atención personalizada en mesa durante el evento', 'persona', 80.00, 'ATENCIÓN', 'DISPONIBLE', 1);

INSERT INTO servicio (nombre, descripcion, unidad_medida, precio, tipo_servicio, estado, id_usuario_creacion)
VALUES ('Servicio de bartender', 'Preparación de cócteles y bebidas en barra', 'persona', 120.00, 'ATENCIÓN', 'DISPONIBLE', 1);

INSERT INTO servicio (nombre, descripcion, unidad_medida, precio, tipo_servicio, estado, id_usuario_creacion)
VALUES ('DJ para eventos', 'Música en vivo y animación durante el evento', 'evento', 350.00, 'ENTRETENIMIENTO', 'DISPONIBLE', 1);

INSERT INTO servicio (nombre, descripcion, unidad_medida, precio, tipo_servicio, estado, id_usuario_creacion)
VALUES ('Decoración temática', 'Ambientación personalizada según tipo de evento', 'evento', 250.00, 'LOGÍSTICA', 'DISPONIBLE', 1);

INSERT INTO servicio (nombre, descripcion, unidad_medida, precio, tipo_servicio, estado, id_usuario_creacion)
VALUES ('Servicio de limpieza post-evento', 'Limpieza completa del salón y áreas utilizadas', 'evento', 180.00, 'LOGÍSTICA', 'DISPONIBLE', 1);

INSERT INTO servicio (nombre, descripcion, unidad_medida, precio, tipo_servicio, estado, id_usuario_creacion)
VALUES ('Animador infantil', 'Entretenimiento para niños durante el evento', 'persona', 200.00, 'ENTRETENIMIENTO', 'DISPONIBLE', 1);

INSERT INTO servicio (nombre, descripcion, unidad_medida, precio, tipo_servicio, estado, id_usuario_creacion)
VALUES ('Fotografía profesional', 'Cobertura fotográfica del evento completo', 'evento', 400.00, 'ENTRETENIMIENTO', 'DISPONIBLE', 1);

INSERT INTO servicio (nombre, descripcion, unidad_medida, precio, tipo_servicio, estado, id_usuario_creacion)
VALUES ('Proyector y pantalla', 'Equipo audiovisual para presentaciones o videos', 'evento', 150.00, 'LOGÍSTICA', 'DISPONIBLE', 1);

INSERT INTO servicio (nombre, descripcion, unidad_medida, precio, tipo_servicio, estado, id_usuario_creacion)
VALUES ('Servicio de seguridad', 'Personal de seguridad para control de acceso y orden', 'persona', 100.00, 'LOGÍSTICA', 'DISPONIBLE', 1);

INSERT INTO servicio (nombre, descripcion, unidad_medida, precio, tipo_servicio, estado, id_usuario_creacion)
VALUES ('Mesa de dulces', 'Montaje de mesa con variedad de postres y decoración', 'evento', 220.00, 'LOGÍSTICA', 'DISPONIBLE', 1);


-- SELECT * FROM servicio;


INSERT INTO tipo_evento (nombre, descripcion, id_usuario_creacion) 
VALUES ('Cumpleaños', 'Celebración de cumpleaños con decoración, música y atención personalizada', 1);

INSERT INTO tipo_evento (nombre, descripcion, id_usuario_creacion) 
VALUES ('Aniversario', 'Evento para conmemorar aniversarios personales o corporativos', 1);

INSERT INTO tipo_evento (nombre, descripcion, id_usuario_creacion) 
VALUES ('Boda', 'Recepción de matrimonio con ambientación especial y servicios premium', 1);

INSERT INTO tipo_evento (nombre, descripcion, id_usuario_creacion) 
VALUES ('Evento corporativo', 'Reuniones empresariales, lanzamientos o capacitaciones con atención formal', 1);

INSERT INTO tipo_evento (nombre, descripcion, id_usuario_creacion) 
VALUES ('Bautizo', 'Celebración religiosa y familiar con menú especial y decoración temática', 1);

-- SELECT * FROM tipo_evento;


