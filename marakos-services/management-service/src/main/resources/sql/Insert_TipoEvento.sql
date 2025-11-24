-- Script para insertar tipos de evento en la tabla tipo_evento
-- Base de datos: Marakos Grill

USE marakos_grill;

-- Insertar tipos de evento comunes
INSERT INTO tipo_evento (nombre, descripcion) VALUES
('Cumpleaños', 'Celebración de cumpleaños con decoración y ambiente festivo'),
('Evento Corporativo', 'Reuniones empresariales, presentaciones y eventos de networking'),
('Baby Shower', 'Celebración de bienvenida para el bebé con temática especial'),
('Boda', 'Ceremonia y recepción de boda en instalaciones elegantes'),
('Aniversario', 'Celebración de aniversario matrimonial o de empresa'),
('Graduación', 'Festejo de graduación universitaria o escolar'),
('Despedida de Soltero/a', 'Evento previo a la boda con amigos y familiares'),
('Reunión Familiar', 'Encuentro familiar para celebraciones especiales'),
('Quinceañera', 'Celebración de los quince años con fiesta tradicional'),
('Evento Social', 'Eventos sociales diversos y reuniones de grupos');

-- Verificar los datos insertados
SELECT * FROM tipo_evento ORDER BY id_tipo_evento;
