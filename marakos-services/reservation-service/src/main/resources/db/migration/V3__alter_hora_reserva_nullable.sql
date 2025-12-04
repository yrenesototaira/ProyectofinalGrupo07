-- Migración para permitir NULL en hora_reserva
-- Necesario para reservas de eventos que no requieren hora específica

ALTER TABLE reserva 
ALTER COLUMN hora_reserva DROP NOT NULL;

-- Comentario en la columna para documentar el cambio
COMMENT ON COLUMN reserva.hora_reserva IS 'Hora de la reserva. NULL para eventos (solo requieren fecha y turno)';
COMMIT;