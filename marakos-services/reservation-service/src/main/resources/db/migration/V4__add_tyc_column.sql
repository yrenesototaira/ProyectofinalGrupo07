-- Migración para agregar columna tyc (términos y condiciones)
-- El campo indica si el usuario aceptó los términos y condiciones al realizar la reserva

ALTER TABLE reserva 
ADD COLUMN tyc INTEGER DEFAULT 0 NOT NULL 
CHECK (tyc IN (0, 1));

-- Comentario en la columna para documentar su propósito
COMMENT ON COLUMN reserva.tyc IS 'Indica si el usuario aceptó términos y condiciones: 0 = No aceptado, 1 = Aceptado';

-- Actualizar reservas existentes a 1 (asumiendo que fueron aceptadas implícitamente)
UPDATE reserva SET tyc = 1 WHERE tyc = 0;

COMMIT;
