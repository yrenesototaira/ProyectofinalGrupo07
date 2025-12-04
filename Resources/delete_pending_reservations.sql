-- ========================================
-- Script para Eliminar Reservas PENDIENTES y PENDIENTE_PAGO
-- ========================================
-- Este script elimina todas las reservas con estado 'PENDIENTE' o 'PENDIENTE_PAGO'
-- junto con sus registros relacionados en otras tablas
-- ========================================

-- Ejecutar dentro de una transacción para poder revertir si algo sale mal
BEGIN;

-- Mostrar conteo de reservas a eliminar
SELECT 
    COUNT(*) as "Total Reservas a Eliminar",
    STRING_AGG(CAST(id_reserva AS VARCHAR), ', ') as "IDs de Reservas"
FROM reserva 
WHERE UPPER(estado) IN ('PENDIENTE', 'PENDIENTE_PAGO');

-- Paso 1: Eliminar registros relacionados en la tabla 'reserva_mesa'
DELETE FROM reserva_mesa 
WHERE id_reserva IN (
    SELECT id_reserva 
    FROM reserva 
    WHERE UPPER(estado) IN ('PENDIENTE', 'PENDIENTE_PAGO')
);

-- Paso 2: Eliminar registros relacionados en la tabla 'reserva_producto'
DELETE FROM reserva_producto 
WHERE id_reserva IN (
    SELECT id_reserva 
    FROM reserva 
    WHERE UPPER(estado) IN ('PENDIENTE', 'PENDIENTE_PAGO')
);

-- Paso 3: Eliminar registros relacionados en la tabla 'reserva_evento'
DELETE FROM reserva_evento 
WHERE id_reserva IN (
    SELECT id_reserva 
    FROM reserva 
    WHERE UPPER(estado) IN ('PENDIENTE', 'PENDIENTE_PAGO')
);

-- Paso 4: Eliminar transacciones relacionadas
DELETE FROM transaccion 
WHERE id_reserva IN (
    SELECT id_reserva 
    FROM reserva 
    WHERE UPPER(estado) IN ('PENDIENTE', 'PENDIENTE_PAGO')
);

-- Paso 5: Eliminar notificaciones relacionadas (si existe la tabla)
DELETE FROM notificacion 
WHERE id_reserva IN (
    SELECT id_reserva 
    FROM reserva 
    WHERE UPPER(estado) IN ('PENDIENTE', 'PENDIENTE_PAGO')
);

-- Paso 6: Finalmente, eliminar las reservas con estado PENDIENTE o PENDIENTE_PAGO
DELETE FROM reserva 
WHERE UPPER(estado) IN ('PENDIENTE', 'PENDIENTE_PAGO');

-- Mostrar resultado
SELECT 
    COUNT(*) as "Reservas Restantes con Estados PENDIENTE o PENDIENTE_PAGO"
FROM reserva 
WHERE UPPER(estado) IN ('PENDIENTE', 'PENDIENTE_PAGO');

-- Si todo está correcto, confirmar los cambios con:
-- COMMIT;

-- Si algo salió mal y quieres revertir los cambios, usa:
-- ROLLBACK;

-- Por seguridad, el script termina sin hacer COMMIT automático
-- Revisa los resultados y ejecuta COMMIT manualmente si estás conforme
ROLLBACK; -- Cambia a COMMIT; cuando estés seguro
