package com.marakosgrill.notification.controller;

import com.marakosgrill.notification.service.NotificationService;
import com.marakosgrill.notification.service.ReservationNotificationData;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notification")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * Endpoint para enviar notificación de reserva confirmada
     */
    @PostMapping("/reservation/confirmed")
    public ResponseEntity<?> sendReservationConfirmation(@RequestBody ReservationNotificationData data) {
        try {
            log.info("╔═══════════════════════════════════════════════════════════════════╗");
            log.info("║  🔔 PETICIÓN RECIBIDA EN NOTIFICATION CONTROLLER                ║");
            log.info("╚═══════════════════════════════════════════════════════════════════╝");
            log.info("=== INICIO NotificationController.sendReservationConfirmation ===");
            log.info("📋 Datos recibidos:");
            log.info("   • Cliente: {}", data.getCustomerName());
            log.info("   • Teléfono: {}", data.getCustomerPhone());
            log.info("   • Email: {}", data.getCustomerEmail());
            log.info("   • Código de Reserva: {}", data.getReservationCode());
            log.info("   • Fecha: {}", data.getReservationDate());
            log.info("   • Hora: {}", data.getReservationTime());
            log.info("   • Comensales: {}", data.getGuestCount());
            log.info("Enviando notificación de reserva confirmada para: {}", data.getCustomerName());
            
            boolean sent = notificationService.sendReservationConfirmation(data);
            
            if (sent) {
                log.info("✅ Notificación enviada exitosamente para reserva: {}", data.getReservationCode());
                return ResponseEntity.ok().body(new NotificationResponse(
                    true, 
                    "Notificación enviada exitosamente", 
                    data.getReservationCode()
                ));
            } else {
                log.error("❌ Error enviando notificación para reserva: {}", data.getReservationCode());
                return ResponseEntity.status(500).body(new NotificationResponse(
                    false, 
                    "Error enviando notificación", 
                    data.getReservationCode()
                ));
            }
            
        } catch (Exception e) {
            log.error("🔥 EXCEPCIÓN en sendReservationConfirmation: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(new NotificationResponse(
                false, 
                "Error interno del servidor: " + e.getMessage(), 
                data.getReservationCode()
            ));
        } finally {
            log.info("=== FIN NotificationController.sendReservationConfirmation ===");
        }
    }

    /**
     * Endpoint para enviar recordatorio de reserva
     */
    @PostMapping("/reservation/reminder")
    public ResponseEntity<?> sendReservationReminder(@RequestBody ReservationNotificationData data) {
        try {
            log.info("Enviando recordatorio de reserva para: {}", data.getCustomerName());
            
            boolean sent = notificationService.sendReservationReminder(data);
            
            if (sent) {
                return ResponseEntity.ok().body(new NotificationResponse(
                    true, 
                    "Recordatorio enviado exitosamente", 
                    data.getReservationCode()
                ));
            } else {
                return ResponseEntity.status(500).body(new NotificationResponse(
                    false, 
                    "Error enviando recordatorio", 
                    data.getReservationCode()
                ));
            }
            
        } catch (Exception e) {
            log.error("Error en sendReservationReminder: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(new NotificationResponse(
                false, 
                "Error interno del servidor: " + e.getMessage(), 
                data.getReservationCode()
            ));
        }
    }

    /**
     * Endpoint para enviar notificación de cancelación
     */
    @PostMapping("/reservation/cancelled")
    public ResponseEntity<?> sendCancellationNotification(@RequestBody ReservationNotificationData data) {
        try {
            log.info("Enviando notificación de cancelación para: {}", data.getCustomerName());
            
            boolean sent = notificationService.sendCancellationNotification(data);
            
            if (sent) {
                return ResponseEntity.ok().body(new NotificationResponse(
                    true, 
                    "Notificación de cancelación enviada exitosamente", 
                    data.getReservationCode()
                ));
            } else {
                return ResponseEntity.status(500).body(new NotificationResponse(
                    false, 
                    "Error enviando notificación de cancelación", 
                    data.getReservationCode()
                ));
            }
            
        } catch (Exception e) {
            log.error("Error en sendCancellationNotification: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(new NotificationResponse(
                false, 
                "Error interno del servidor: " + e.getMessage(), 
                data.getReservationCode()
            ));
        }
    }

    /**
     * Endpoint para verificar el estado del servicio
     */
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        log.info("🔍 Health check solicitado - IP: {}", getClientIP());
        log.info("🔍 Health check endpoint llamado exitosamente");
        return ResponseEntity.ok().body(new NotificationResponse(
            true, 
            "Notification Service está funcionando correctamente", 
            null
        ));
    }

    private String getClientIP() {
        try {
            // Obtener la IP del cliente si está disponible
            return "localhost";
        } catch (Exception e) {
            return "unknown";
        }
    }

    /**
     * Endpoint de prueba para enviar notificación test
     */
    @PostMapping("/test")
    public ResponseEntity<?> testNotification() {
        try {
            log.info("🧪 Test notification solicitado");
            
            // Crear datos de prueba
            ReservationNotificationData testData = new ReservationNotificationData();
            testData.setCustomerName("Usuario Test");
            testData.setCustomerPhone("+51-999-888-777");
            testData.setCustomerEmail("test@example.com");
            testData.setReservationCode("TEST-001");
            testData.setReservationDate("2025-11-02");
            testData.setReservationTime("19:00");
            testData.setGuestCount(2);
            testData.setPaymentType("TEST");
            testData.setTotalAmount(50.00);
            testData.setTableInfo("TEST-MESA");
            testData.setSpecialRequests("Prueba de notificación");
            testData.setPaymentStatus("PAGADO");
            testData.setReservationStatus("CONFIRMADA");

            boolean sent = notificationService.sendReservationConfirmation(testData);
            
            if (sent) {
                return ResponseEntity.ok().body(new NotificationResponse(
                    true, 
                    "Test notification enviado exitosamente", 
                    "TEST-001"
                ));
            } else {
                return ResponseEntity.status(500).body(new NotificationResponse(
                    false, 
                    "Error enviando test notification", 
                    "TEST-001"
                ));
            }
            
        } catch (Exception e) {
            log.error("🔥 Error en test notification: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(new NotificationResponse(
                false, 
                "Error interno: " + e.getMessage(), 
                "TEST-001"
            ));
        }
    }

    /**
     * Endpoint de diagnóstico para verificar configuración
     */
    @GetMapping("/diagnostic")
    public ResponseEntity<?> diagnostic() {
        try {
            log.info("🔍 Diagnóstico solicitado");
            
            java.util.Map<String, Object> diagnostic = new java.util.HashMap<>();
            diagnostic.put("service", "notification-service");
            diagnostic.put("status", "running");
            diagnostic.put("timestamp", java.time.LocalDateTime.now().toString());
            diagnostic.put("message", "Servicio funcionando - Token de WhatsApp configurado pero no validado");
            diagnostic.put("note", "Para probar envío real, usar endpoint /test o /reservation/confirmed");
            
            return ResponseEntity.ok(diagnostic);
            
        } catch (Exception e) {
            log.error("Error en diagnóstico: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    /**
     * Clase para las respuestas del controlador
     */
    public static class NotificationResponse {
        private boolean success;
        private String message;
        private String reservationCode;

        public NotificationResponse(boolean success, String message, String reservationCode) {
            this.success = success;
            this.message = message;
            this.reservationCode = reservationCode;
        }

        // Getters y setters
        public boolean isSuccess() {
            return success;
        }

        public void setSuccess(boolean success) {
            this.success = success;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public String getReservationCode() {
            return reservationCode;
        }

        public void setReservationCode(String reservationCode) {
            this.reservationCode = reservationCode;
        }
    }
}