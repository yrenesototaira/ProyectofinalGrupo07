package com.marakosgrill.payment.repository;

import com.marakosgrill.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    /**
     * Buscar pagos por ID de reserva
     */
    List<Payment> findByReservationId(Long reservationId);

    /**
     * Buscar pago por Culqi Charge ID
     */
    Optional<Payment> findByCulqiChargeId(String culqiChargeId);

    /**
     * Buscar pagos por email del cliente
     */
    List<Payment> findByCustomerEmailOrderByPaymentDateDesc(String customerEmail);

    /**
     * Buscar pagos por estado
     */
    List<Payment> findByStatus(Payment.PaymentStatus status);

    /**
     * Buscar pagos por rango de fechas
     */
    @Query("SELECT p FROM Payment p WHERE p.paymentDate BETWEEN :startDate AND :endDate ORDER BY p.paymentDate DESC")
    List<Payment> findByPaymentDateBetween(@Param("startDate") LocalDateTime startDate, 
                                         @Param("endDate") LocalDateTime endDate);

    /**
     * Buscar pagos completados por ID de reserva
     */
    @Query("SELECT p FROM Payment p WHERE p.reservationId = :reservationId AND p.status = 'COMPLETED'")
    List<Payment> findCompletedPaymentsByReservationId(@Param("reservationId") Long reservationId);

    /**
     * Contar pagos por estado
     */
    Long countByStatus(Payment.PaymentStatus status);

    /**
     * Verificar si existe un pago exitoso para una reserva
     */
    boolean existsByReservationIdAndStatus(Long reservationId, Payment.PaymentStatus status);
}