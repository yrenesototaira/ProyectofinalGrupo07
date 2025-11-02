-- Active: 1761520750866@@marakosbd.cx4a2amsay8c.us-east-2.rds.amazonaws.com@5432@db_marakos_grill
-- Active: 1761520750866@@marakosbd.cx4a2amsay8c.us-east-2.rds.amazonaws.com@5432@db_marakos_grill
-- Tabla para almacenar los pagos procesados
CREATE TABLE IF NOT EXISTS payments (
    transaction_id BIGSERIAL PRIMARY KEY,
    reservation_id BIGINT NOT NULL,
    payment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    payment_method VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    external_transaction_id VARCHAR(100),
    culqi_charge_id VARCHAR(100),
    currency VARCHAR(3) NOT NULL DEFAULT 'PEN',
    customer_email VARCHAR(255) NOT NULL,
    customer_name VARCHAR(255),
    customer_phone VARCHAR(20),
    description TEXT,
    processed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reference_code VARCHAR(100),
    error_message TEXT,
    card_last_four VARCHAR(20),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_payments_reservation_id ON payments(reservation_id);
CREATE INDEX IF NOT EXISTS idx_payments_culqi_charge_id ON payments(culqi_charge_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer_email ON payments(customer_email);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date);

-- Restricciones
ALTER TABLE payments 
ADD CONSTRAINT chk_payments_status 
CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'ERROR', 'REFUNDED'));

ALTER TABLE payments 
ADD CONSTRAINT chk_payments_amount 
CHECK (amount > 0);

-- Comentarios para documentar la tabla
COMMENT ON TABLE payments IS 'Tabla para almacenar todos los pagos procesados a través de Culqi y otros métodos';
COMMENT ON COLUMN payments.transaction_id IS 'ID único autogenerado para el pago en nuestra base de datos';
COMMENT ON COLUMN payments.reservation_id IS 'ID de la reserva asociada al pago';
COMMENT ON COLUMN payments.culqi_charge_id IS 'ID de la transacción en Culqi (ej: chr_test_DMhguHPDY8W9fCZj)';
COMMENT ON COLUMN payments.reference_code IS 'Código de referencia proporcionado por Culqi';
COMMENT ON COLUMN payments.card_last_four IS 'Últimos 4 dígitos de la tarjeta utilizada (formato: 1234******5678)';