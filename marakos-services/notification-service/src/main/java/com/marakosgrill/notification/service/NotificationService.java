package com.marakosgrill.notification.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final WhatsAppService whatsAppService;
    private final EmailService emailService;

    /**
     * Envía notificación de confirmación de reserva (WhatsApp + Email)
     */
    public boolean sendReservationConfirmation(ReservationNotificationData data) {
        try {
            log.info("🚀 INICIO NotificationService.sendReservationConfirmation");
            log.info("📋 Procesando notificación de confirmación para reserva: {}", data.getReservationCode());
            log.info("📞 Teléfono destino: {}, Cliente: {}", data.getCustomerPhone(), data.getCustomerName());
            log.info("📧 Email destino: {}", data.getCustomerEmail());
            
            // Validar datos obligatorios
            if (!isValidNotificationData(data)) {
                log.error("❌ Datos de notificación inválidos para reserva: {}", data.getReservationCode());
                return false;
            }

            log.info("✅ Datos validados correctamente, enviando notificaciones...");
            
            // Enviar via WhatsApp
            boolean whatsappResult = whatsAppService.sendReservationConfirmation(data.getCustomerPhone(), data);
            
            if (whatsappResult) {
                log.info("🎉 WhatsApp enviado exitosamente para reserva: {}", data.getReservationCode());
            } else {
                log.error("💥 Falló el envío de WhatsApp para reserva: {}", data.getReservationCode());
            }
            
            // Enviar via Email
            boolean emailResult = emailService.sendReservationConfirmationEmail(data);
            
            if (emailResult) {
                log.info("📬 Email enviado exitosamente para reserva: {}", data.getReservationCode());
            } else {
                log.error("📭 Falló el envío de Email para reserva: {}", data.getReservationCode());
            }
            
            // Retornar true si al menos uno fue exitoso
            boolean result = whatsappResult || emailResult;
            
            if (result) {
                log.info("✅ Al menos una notificación fue enviada exitosamente");
            } else {
                log.error("❌ Todas las notificaciones fallaron");
            }
            
            return result;
            
        } catch (Exception e) {
            log.error("🔥 EXCEPCIÓN enviando notificación de confirmación: {}", e.getMessage(), e);
            return false;
        } finally {
            log.info("🏁 FIN NotificationService.sendReservationConfirmation");
        }
    }

    /**
     * Envía recordatorio de reserva
     */
    public boolean sendReservationReminder(ReservationNotificationData data) {
        try {
            log.info("Procesando recordatorio para reserva: {}", data.getReservationCode());
            
            if (!isValidNotificationData(data)) {
                log.error("Datos de notificación inválidos para recordatorio: {}", data.getReservationCode());
                return false;
            }

            return whatsAppService.sendReservationReminder(data.getCustomerPhone(), data);
            
        } catch (Exception e) {
            log.error("Error enviando recordatorio: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Envía notificación de cancelación
     */
    public boolean sendCancellationNotification(ReservationNotificationData data) {
        try {
            log.info("Procesando notificación de cancelación para reserva: {}", data.getReservationCode());
            
            if (!isValidNotificationData(data)) {
                log.error("Datos de notificación inválidos para cancelación: {}", data.getReservationCode());
                return false;
            }

            return whatsAppService.sendCancellationNotification(data.getCustomerPhone(), data);
            
        } catch (Exception e) {
            log.error("Error enviando notificación de cancelación: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Valida que los datos de notificación sean válidos
     */
    private boolean isValidNotificationData(ReservationNotificationData data) {
        if (data == null) {
            log.error("ReservationNotificationData es null");
            return false;
        }

        if (data.getCustomerPhone() == null || data.getCustomerPhone().trim().isEmpty()) {
            log.error("Número de teléfono del cliente es requerido");
            return false;
        }

        if (data.getCustomerName() == null || data.getCustomerName().trim().isEmpty()) {
            log.error("Nombre del cliente es requerido");
            return false;
        }

        if (data.getReservationCode() == null || data.getReservationCode().trim().isEmpty()) {
            log.error("Código de reserva es requerido");
            return false;
        }

        if (data.getReservationDate() == null) {
            log.error("Fecha de reserva es requerida");
            return false;
        }

        if (data.getReservationTime() == null || data.getReservationTime().trim().isEmpty()) {
            log.error("Hora de reserva es requerida");
            return false;
        }

        // Validar formato del número de teléfono (debe incluir código de país)
        String phone = data.getCustomerPhone().trim();
        if (!phone.startsWith("+")) {
            log.error("Número de teléfono debe incluir código de país (ej: +51...)");
            return false;
        }

        // Campos opcionales - agregar valores por defecto si son null
        if (data.getCustomerEmail() == null) {
            data.setCustomerEmail("no-disponible@marakos.pe");
        }
        
        if (data.getTableInfo() == null) {
            data.setTableInfo("Mesa asignada al llegar");
        }
        
        if (data.getSpecialRequests() == null) {
            data.setSpecialRequests("Sin observaciones especiales");
        }
        
        if (data.getPaymentStatus() == null) {
            data.setPaymentStatus("PENDIENTE");
        }
        
        if (data.getReservationStatus() == null) {
            data.setReservationStatus("CONFIRMADA");
        }

        if (data.getTotalAmount() == null) {
            data.setTotalAmount(0.0);
        }

        if (data.getGuestCount() == null) {
            data.setGuestCount(1);
        }

        log.info("✅ Datos validados y completados con valores por defecto donde era necesario");
        return true;
    }

    /**
     * Formatea el número de teléfono para WhatsApp API
     */
    private String formatPhoneNumber(String phone) {
        // Remover espacios, guiones y paréntesis
        String cleanPhone = phone.replaceAll("[\\s\\-\\(\\)]", "");
        
        // Si no tiene +, agregarlo (asumiendo Perú +51)
        if (!cleanPhone.startsWith("+")) {
            cleanPhone = "+51" + cleanPhone;
        }
        
        return cleanPhone;
    }
}