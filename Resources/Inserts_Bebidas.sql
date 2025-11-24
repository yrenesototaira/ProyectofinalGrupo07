-- ========================================
-- SCRIPT DE INSERCIÓN DE BEBIDAS
-- Restaurante: Marakos Grill
-- Contexto: Restaurante de carnes y parrillas del norte del Perú
-- ========================================

-- Primero, creamos la categoría de Bebidas si no existe
INSERT INTO categoria (nombre, descripcion, id_usuario_creacion) 
VALUES ('Bebidas', 'Bebidas refrescantes, cervezas y licores para acompañar carnes a la parrilla', 1);

-- Nota: Asumiendo que el id_categoria de 'Bebidas' es 8 (siguiente al último en el script maestro)
-- Si ya existe, ajustar el id_categoria según corresponda

-- ========================================
-- 🍺 BEBIDAS PARA MARAKOS GRILL
-- ========================================

-- 1. Chicha Morada - Bebida tradicional peruana
INSERT INTO producto (codigo, nombre, descripción, precio, id_categoria, stock, estado, id_usuario_creacion, imagen_url) 
VALUES ('BEB-01', 'Chicha Morada', 'Bebida tradicional peruana a base de maíz morado, piña y especias', 8.00, 31, 50, 'DISPONIBLE', 1, 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400');

-- 2. Cerveza Cusqueña - Cerveza peruana premium
INSERT INTO producto (codigo, nombre, descripción, precio, id_categoria, stock, estado, id_usuario_creacion, imagen_url) 
VALUES ('BEB-02', 'Cerveza Cusqueña (botella 620ml)', 'Cerveza rubia peruana premium, ideal para carnes a la parrilla', 12.00, 31, 80, 'DISPONIBLE', 1, 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400');

-- 3. Cerveza Cristal - Cerveza popular peruana
INSERT INTO producto (codigo, nombre, descripción, precio, id_categoria, stock, estado, id_usuario_creacion, imagen_url) 
VALUES ('BEB-03', 'Cerveza Cristal (botella 650ml)', 'Cerveza rubia ligera, la más popular del Perú', 10.00, 8, 100, 'DISPONIBLE', 1, 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400');

-- 4. Inca Kola - Gaseosa peruana
INSERT INTO producto (codigo, nombre, descripción, precio, id_categoria, stock, estado, id_usuario_creacion, imagen_url) 
VALUES ('BEB-04', 'Inca Kola (botella 500ml)', 'La gaseosa de sabor nacional, perfecta con comida peruana', 6.00, 31, 70, 'DISPONIBLE', 1, 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400');

-- 5. Limonada Frozen - Limonada helada
INSERT INTO producto (codigo, nombre, descripción, precio, id_categoria, stock, estado, id_usuario_creacion, imagen_url) 
VALUES ('BEB-05', 'Limonada Frozen', 'Limonada peruana helada con hierbabuena fresca', 9.00, 8, 60, 'DISPONIBLE', 1, 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9c?w=400');

-- 6. Pisco Sour - Cóctel bandera del Perú
INSERT INTO producto (codigo, nombre, descripción, precio, id_categoria, stock, estado, id_usuario_creacion, imagen_url) 
VALUES ('BEB-06', 'Pisco Sour', 'Cóctel clásico peruano con pisco, limón, jarabe y amargo de angostura', 18.00, 31, 40, 'DISPONIBLE', 1, 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400');

-- 7. Maracuyá Sour - Variante tropical del Pisco Sour
INSERT INTO producto (codigo, nombre, descripción, precio, id_categoria, stock, estado, id_usuario_creacion, imagen_url) 
VALUES ('BEB-07', 'Maracuyá Sour', 'Pisco Sour con jugo de maracuyá, sabor tropical peruano', 19.00, 31, 35, 'DISPONIBLE', 1, 'https://images.unsplash.com/photo-1546171753-97d7676e4602?w=400');

-- 8. Agua Mineral San Mateo - Agua con gas
INSERT INTO producto (codigo, nombre, descripción, precio, id_categoria, stock, estado, id_usuario_creacion, imagen_url) 
VALUES ('BEB-08', 'Agua Mineral San Mateo (botella 625ml)', 'Agua mineral con gas de San Mateo, refrescante', 5.00, 8, 90, 'DISPONIBLE', 1, 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400');

-- 9. Jugo de Papaya - Jugo natural norteño
INSERT INTO producto (codigo, nombre, descripción, precio, id_categoria, stock, estado, id_usuario_creacion, imagen_url) 
VALUES ('BEB-09', 'Jugo de Papaya Natural', 'Jugo fresco de papaya norteña, cremoso y nutritivo', 10.00, 31, 45, 'DISPONIBLE', 1, 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400');

-- 10. Chilcano de Pisco - Cóctel refrescante peruano
INSERT INTO producto (codigo, nombre, descripción, precio, id_categoria, stock, estado, id_usuario_creacion, imagen_url) 
VALUES ('BEB-10', 'Chilcano de Pisco', 'Pisco con ginger ale, limón y hielo, refrescante y ligero', 16.00, 31, 50, 'DISPONIBLE', 1, 'https://images.unsplash.com/photo-1587223962930-cb7f31384c19?w=400');

-- ========================================
-- 🍷 VINOS - Perfectos para acompañar carnes a la parrilla
-- ========================================

-- 11. Vino Tinto Cabernet Sauvignon - Copa
INSERT INTO producto (codigo, nombre, descripción, precio, id_categoria, stock, estado, id_usuario_creacion, imagen_url) 
VALUES ('VINO-01', 'Vino Tinto Cabernet Sauvignon (Copa)', 'Vino tinto de cuerpo completo, ideal para carnes rojas y parrillas', 22.00, 31, 30, 'DISPONIBLE', 1, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400');

-- 12. Vino Tinto Malbec - Copa
INSERT INTO producto (codigo, nombre, descripción, precio, id_categoria, stock, estado, id_usuario_creacion, imagen_url) 
VALUES ('VINO-02', 'Vino Tinto Malbec (Copa)', 'Vino argentino robusto con notas frutales, perfecto para asados', 24.00, 31, 25, 'DISPONIBLE', 1, 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400');

-- 13. Vino Rosado - Copa
INSERT INTO producto (codigo, nombre, descripción, precio, id_categoria, stock, estado, id_usuario_creacion, imagen_url) 
VALUES ('VINO-03', 'Vino Rosado (Copa)', 'Vino rosado fresco y ligero, excelente para acompañar pollo a la parrilla', 20.00, 31, 28, 'DISPONIBLE', 1, 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=400');

-- ========================================
-- VERIFICACIÓN
-- ========================================
-- Descomentar la siguiente línea para verificar los registros insertados
-- SELECT * FROM producto WHERE id_categoria = 8 ORDER BY codigo;

-- ========================================
-- NOTAS ADICIONALES
-- ========================================
-- 1. Las bebidas incluyen opciones tradicionales peruanas del norte
-- 2. Precios competitivos para acompañar carnes y parrillas
-- 3. Stock inicial considerado para operación regular
-- 4. Incluye bebidas alcohólicas y no alcohólicas
-- 5. Las URLs de imágenes son placeholders de Unsplash, reemplazar con imágenes reales del restaurante
-- 6. Todas las bebidas están marcadas como DISPONIBLES
-- 7. El id_categoria (8) debe ajustarse si la categoría 'Bebidas' tiene otro ID en la base de datos

-- ========================================
-- COMBINACIONES RECOMENDADAS
-- ========================================
-- Carnes rojas -> Cerveza Cusqueña, Pisco Sour, Vino Cabernet, Vino Malbec
-- Pollo a la brasa -> Inca Kola, Chicha Morada, Cerveza Cristal, Vino Rosado
-- Anticuchos -> Cerveza Cristal, Limonada Frozen, Chilcano
-- Combos familiares -> Chicha Morada, Inca Kola, Jugos naturales
-- Parrilladas premium -> Vino Tinto Cabernet, Vino Malbec, Cerveza Cusqueña
