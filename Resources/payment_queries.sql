-- Scripts útiles para consultar la tabla de pagos

-- 1. Ver todos los pagos
SELECT * FROM payments ORDER BY payment_date DESC;

-- 2. Ver pagos por estado
SELECT status, COUNT(*) as cantidad, SUM(amount) as total_amount
FROM payments 
GROUP BY status;

-- 3. Ver pagos completados del día actual
SELECT * FROM payments 
WHERE status = 'COMPLETED' 
AND DATE(payment_date) = CURRENT_DATE
ORDER BY payment_date DESC;

-- 4. Ver pagos por reserva específica
SELECT * FROM payments 
WHERE reservation_id = 200; -- Cambia por el ID de reserva que quieras

-- 5. Ver pagos de un cliente específico
SELECT * FROM payments 
WHERE customer_email = 'cliente@email.com' -- Cambia por el email del cliente
ORDER BY payment_date DESC;

-- 6. Ver estadísticas de pagos por día (últimos 30 días)
SELECT 
    DATE(payment_date) as fecha,
    COUNT(*) as total_transacciones,
    COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as exitosas,
    COUNT(CASE WHEN status = 'FAILED' THEN 1 END) as fallidas,
    SUM(CASE WHEN status = 'COMPLETED' THEN amount ELSE 0 END) as ingresos_totales
FROM payments 
WHERE payment_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(payment_date)
ORDER BY fecha DESC;

-- 7. Ver detalles completos de un pago específico
SELECT 
    transaction_id,
    reservation_id,
    payment_date,
    amount,
    status,
    culqi_charge_id,
    reference_code,
    customer_email,
    customer_name,
    card_last_four,
    error_message
FROM payments 
WHERE transaction_id = 1; -- Cambia por el ID de transacción que quieras

-- 8. Verificar integridad de datos
SELECT 
    COUNT(*) as total_pagos,
    COUNT(CASE WHEN culqi_charge_id IS NOT NULL AND status = 'COMPLETED' THEN 1 END) as con_culqi_id,
    COUNT(CASE WHEN culqi_charge_id IS NULL AND status = 'COMPLETED' THEN 1 END) as sin_culqi_id_completados
FROM payments;