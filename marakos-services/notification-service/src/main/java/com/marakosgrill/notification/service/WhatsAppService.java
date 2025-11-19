package com.marakosgrill.notification.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class WhatsAppService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${whatsapp.api.base-url:https://graph.facebook.com/v22.0}")
    private String whatsappApiUrl;

    @Value("${whatsapp.api.phone-number-id}")
    private String phoneNumberId;

    @Value("${whatsapp.api.access-token}")
    private String accessToken;

    @Value("${whatsapp.message.template.confirmation}")
    private String confirmationTemplate;

    /**
     * Envía notificación de confirmación de reserva
     */
    public boolean sendReservationConfirmation(String customerPhone, ReservationNotificationData data) {
        try {
            log.info("📱 INICIO WhatsAppService.sendReservationConfirmation");
            log.info("📞 Enviando a teléfono: {}", customerPhone);
            log.info("🎫 Código reserva: {}", data.getReservationCode());
            log.info("👤 Cliente: {}", data.getCustomerName());
            log.info("📅 Fecha: {}, Hora: {}", data.getReservationDate(), data.getReservationTime());
            log.info("� Monto: {}", data.getTotalAmount());
            
            boolean result = sendWhatsAppMessageWithTemplate(customerPhone, data);
            
            if (result) {
                log.info("✅ WhatsApp API llamada exitosa para: {}", customerPhone);
            } else {
                log.error("❌ WhatsApp API falló para: {}", customerPhone);
            }
            
            return result;
        } catch (Exception e) {
            log.error("🔥 EXCEPCIÓN en sendReservationConfirmation: {}", e.getMessage(), e);
            return false;
        } finally {
            log.info("🏁 FIN WhatsAppService.sendReservationConfirmation");
        }
    }

    /**
     * Envía mensaje de WhatsApp usando la API de Meta con TEMPLATES
     */
    private boolean sendWhatsAppMessage(String phoneNumber, String message) {
        try {
            log.info("🌐 INICIO sendWhatsAppMessage");
            log.info("⚙️ Configuración WhatsApp API:");
            log.info("   - Base URL: {}", whatsappApiUrl);
            log.info("   - Phone Number ID: {}", phoneNumberId);
            log.info("   - Token length: {} caracteres", accessToken != null ? accessToken.length() : 0);
            
            String url = String.format("%s/%s/messages", whatsappApiUrl, phoneNumberId);
            log.info("🔗 URL COMPLETA DE INVOCACIÓN: {}", url);
            log.info("🌍 Este es el endpoint exacto al que se hará la llamada HTTP POST");
            
            String formattedPhone = formatPhoneNumber(phoneNumber);
            log.info("📱 Teléfono formateado: {}", formattedPhone);
            
            // Validar token
            if (accessToken == null || accessToken.trim().isEmpty()) {
                log.error("❌ Token de acceso no configurado");
                return false;
            }
            
            // Construir el payload usando TEMPLATE (requerido para cuentas no verificadas)
            Map<String, Object> payload = new HashMap<>();
            payload.put("messaging_product", "whatsapp");
            payload.put("to", formattedPhone);
            payload.put("type", "template");
            
            // Template configurado en application.properties
            Map<String, Object> template = new HashMap<>();
            template.put("name", confirmationTemplate);
            
            Map<String, String> language = new HashMap<>();
            language.put("code", "en_US");
            template.put("language", language);
            
            payload.put("template", template);

            log.info("📦 Payload construido (TEMPLATE): {}", objectMapper.writeValueAsString(payload));
            log.info("📋 Usando template: '{}' (configurado en properties)", confirmationTemplate);

            // Headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(accessToken);
            log.info("🔑 Token configurado, length: {}", accessToken.length());

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
            
            log.info("🚀 Enviando request a WhatsApp API...");
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            
            log.info("📨 Respuesta WhatsApp API - Status: {}, Body: {}", 
                    response.getStatusCode(), response.getBody());
            
            // Verificar respuesta de WhatsApp API
            String responseBody = response.getBody();
            if (responseBody != null && responseBody.contains("error")) {
                log.error("❌ WhatsApp API retornó error: {}", responseBody);
                return false;
            }
            
            if (response.getStatusCode() == HttpStatus.OK ||
                response.getStatusCode() == HttpStatus.CREATED ||
                response.getStatusCode() == HttpStatus.ACCEPTED) {
                log.info("✅ Mensaje de WhatsApp enviado exitosamente a: {}", phoneNumber);
                log.info("📋 Respuesta completa de WhatsApp: {}", responseBody);
                return true;
            } else {
                log.error("❌ Error enviando mensaje de WhatsApp. Status: {}, Response: {}", 
                         response.getStatusCode(), response.getBody());
                return false;
            }
            
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            log.error("🔥 Error HTTP del cliente en sendWhatsAppMessage: {}", e.getMessage());
            log.error("🔍 Código de estado: {}", e.getStatusCode());
            log.error("🔍 Cuerpo de respuesta: {}", e.getResponseBodyAsString());
            
            if (e.getStatusCode().value() == 401) {
                log.error("❌ Error 401: Token inválido o expirado");
            } else if (e.getStatusCode().value() == 404) {
                log.error("❌ Error 404: Verifica la URL de la API y el Phone Number ID");
            } else if (e.getStatusCode().value() == 429) {
                log.error("❌ Error 429: Límite de mensajes excedido");
            } else if (e.getStatusCode().value() == 400) {
                log.error("❌ Error 400: Solicitud incorrecta - Verifica el formato del payload");
            }
            return false;
        } catch (Exception e) {
            log.error("🔥 Error general en sendWhatsAppMessage: {} - Causa: {}", e.getMessage(), e.getCause());
            log.error("🔍 Tipo de excepción: {}", e.getClass().getName());
            return false;
        }
    }

    /**
     * Envía mensaje de WhatsApp usando TEMPLATE con PARÁMETROS personalizados
     */
    private boolean sendWhatsAppMessageWithTemplate(String phoneNumber, ReservationNotificationData data) {
        try {
            log.info("🌐 INICIO sendWhatsAppMessageWithTemplate");
            log.info("⚙️ Configuración WhatsApp API:");
            log.info("   - Base URL: {}", whatsappApiUrl);
            log.info("   - Phone Number ID: {}", phoneNumberId);
            log.info("   - Token length: {} caracteres", accessToken != null ? accessToken.length() : 0);
            log.info("   - Template: {}", confirmationTemplate);
            
            String url = String.format("%s/%s/messages", whatsappApiUrl, phoneNumberId);
            log.info("🔗 URL COMPLETA DE INVOCACIÓN: {}", url);
            
            String formattedPhone = formatPhoneNumber(phoneNumber);
            log.info("📱 Teléfono formateado: {}", formattedPhone);
            
            // Validar token
            if (accessToken == null || accessToken.trim().isEmpty()) {
                log.error("❌ Token de acceso no configurado");
                return false;
            }
            
            // Construir el payload usando TEMPLATE con parámetros
            Map<String, Object> payload = new HashMap<>();
            payload.put("messaging_product", "whatsapp");
            payload.put("to", formattedPhone);
            payload.put("type", "template");
            
            // Template con parámetros
            Map<String, Object> template = new HashMap<>();
            template.put("name", confirmationTemplate);
            
            Map<String, String> language = new HashMap<>();
            language.put("code", "es"); // Español para el template personalizado
            template.put("language", language);
            
            // Agregar componentes con parámetros
            java.util.List<Map<String, Object>> components = new java.util.ArrayList<>();
            
            // Componente BODY con los parámetros
            Map<String, Object> bodyComponent = new HashMap<>();
            bodyComponent.put("type", "body");
            
            java.util.List<Map<String, Object>> parameters = new java.util.ArrayList<>();
            
            // Parámetro 1: Nombre del cliente
            Map<String, Object> param1 = new HashMap<>();
            param1.put("type", "text");
            param1.put("text", data.getCustomerName());
            parameters.add(param1);
            
            // Parámetro 2: Código de reserva
            Map<String, Object> param2 = new HashMap<>();
            param2.put("type", "text");
            param2.put("text", data.getReservationCode());
            parameters.add(param2);
            
            // Parámetro 3: Fecha
            Map<String, Object> param3 = new HashMap<>();
            param3.put("type", "text");
            param3.put("text", data.getReservationDate());
            parameters.add(param3);
            
            // Parámetro 4: Hora
            Map<String, Object> param4 = new HashMap<>();
            param4.put("type", "text");
            param4.put("text", data.getReservationTime());
            parameters.add(param4);
            
            bodyComponent.put("parameters", parameters);
            components.add(bodyComponent);
            
            template.put("components", components);
            payload.put("template", template);

            log.info("📦 Payload construido con parámetros:");
            log.info("   - Nombre: {}", data.getCustomerName());
            log.info("   - Código: {}", data.getReservationCode());
            log.info("   - Fecha: {}", data.getReservationDate());
            log.info("   - Hora: {}", data.getReservationTime());
            log.info("📋 JSON completo: {}", objectMapper.writeValueAsString(payload));

            // Headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(accessToken);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
            
            log.info("🚀 Enviando request a WhatsApp API con template parametrizado...");
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
            
            log.info("📨 Respuesta WhatsApp API - Status: {}, Body: {}", 
                    response.getStatusCode(), response.getBody());
            
            // Verificar respuesta de WhatsApp API
            String responseBody = response.getBody();
            if (responseBody != null && responseBody.contains("error")) {
                log.error("❌ WhatsApp API retornó error: {}", responseBody);
                return false;
            }
            
            if (response.getStatusCode() == HttpStatus.OK ||
                response.getStatusCode() == HttpStatus.CREATED ||
                response.getStatusCode() == HttpStatus.ACCEPTED) {
                log.info("✅ Mensaje parametrizado enviado exitosamente a: {}", phoneNumber);
                log.info("📋 Respuesta completa de WhatsApp: {}", responseBody);
                return true;
            } else {
                log.error("❌ Error enviando mensaje. Status: {}, Response: {}", 
                         response.getStatusCode(), response.getBody());
                return false;
            }
            
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            log.error("🔥 Error HTTP en sendWhatsAppMessageWithTemplate: {}", e.getMessage());
            log.error("🔍 Código de estado: {}", e.getStatusCode());
            log.error("🔍 Cuerpo de respuesta: {}", e.getResponseBodyAsString());
            return false;
        } catch (Exception e) {
            log.error("🔥 Error general en sendWhatsAppMessageWithTemplate: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Construye el mensaje de confirmación de reserva
     */
    private String buildReservationMessage(ReservationNotificationData data) {
        // MENSAJE SIMPLIFICADO PARA PRUEBAS
        log.info("🧪 Construyendo mensaje simplificado de prueba");
        return "Hello funciona - Reserva: " + data.getReservationCode();
        
        /* MENSAJE COMPLETO - COMENTADO PARA PRUEBAS
        StringBuilder message = new StringBuilder();
        message.append("🍽️ *MARAKOS GRILL - Confirmación de Reserva* 🍽️\n\n");
        message.append("¡Hola ").append(data.getCustomerName()).append("! 👋\n\n");
        message.append("Tu reserva ha sido *CONFIRMADA* exitosamente ✅\n\n");
        message.append("📋 *DETALLES DE TU RESERVA:*\n");
        message.append("• *ID de Reserva:* ").append(data.getReservationCode()).append("\n");
        message.append("• *Fecha:* ").append(data.getReservationDate()).append("\n");
        message.append("• *Hora:* ").append(data.getReservationTime()).append("\n");
        message.append("• *Comensales:* ").append(data.getGuestCount()).append(" personas\n");
        message.append("• *Mesa:* ").append(data.getTableInfo()).append("\n");
        
        if (data.getSpecialRequests() != null && !data.getSpecialRequests().isEmpty()) {
            message.append("• *Observaciones:* ").append(data.getSpecialRequests()).append("\n");
        }
        
        message.append("\n💰 *INFORMACIÓN DE PAGO:*\n");
        if ("presencial".equals(data.getPaymentType())) {
            message.append("• *Método:* Pago Presencial 🏪\n");
            message.append("• *Monto a pagar:* S/ ").append(String.format("%.2f", data.getTotalAmount())).append("\n");
            message.append("• *⏰ IMPORTANTE:* Debes pagar en el restaurante dentro de 24 horas\n");
        } else {
            message.append("• *Método:* Pago Online 💳\n");
            message.append("• *Estado:* ").append(data.getPaymentStatus()).append("\n");
            message.append("• *Monto:* S/ ").append(String.format("%.2f", data.getTotalAmount())).append("\n");
        }
        
        message.append("\n📍 *UBICACIÓN:*\n");
        message.append("Av. Principal 123, Lima\n");
        message.append("📞 Teléfono: (01) 234-5678\n\n");
        
        message.append("🕐 *HORARIOS DE ATENCIÓN:*\n");
        message.append("Lunes a Domingo: 12:00 PM - 11:00 PM\n\n");
        
        message.append("✨ *¡Te esperamos!* ✨\n");
        message.append("Si tienes alguna consulta, no dudes en contactarnos.\n\n");
        message.append("_Mensaje generado automáticamente por Marakos Grill_");
        
        return message.toString();
        */
    }

    /**
     * Formatea el número de teléfono para WhatsApp (formato internacional)
     */
    private String formatPhoneNumber(String phoneNumber) {
        // Remover espacios, guiones y otros caracteres
        String cleaned = phoneNumber.replaceAll("[^0-9+]", "");
        
        // Si no tiene código de país, agregar +51 (Perú)
        if (!cleaned.startsWith("+")) {
            if (cleaned.startsWith("51")) {
                cleaned = "+" + cleaned;
            } else if (cleaned.startsWith("9")) {
                cleaned = "+51" + cleaned;
            } else {
                cleaned = "+51" + cleaned;
            }
        }
        
        return cleaned;
    }

    /**
     * Envía notificación de recordatorio (24 horas antes)
     */
    public boolean sendReservationReminder(String customerPhone, ReservationNotificationData data) {
        try {
            String message = buildReminderMessage(data);
            return sendWhatsAppMessage(customerPhone, message);
        } catch (Exception e) {
            log.error("Error enviando recordatorio por WhatsApp: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Construye mensaje de recordatorio
     */
    private String buildReminderMessage(ReservationNotificationData data) {
        StringBuilder message = new StringBuilder();
        message.append("⏰ *RECORDATORIO - MARAKOS GRILL* ⏰\n\n");
        message.append("¡Hola ").append(data.getCustomerName()).append("! 👋\n\n");
        message.append("Te recordamos que tienes una reserva *MAÑANA* 📅\n\n");
        message.append("📋 *DETALLES:*\n");
        message.append("• *Fecha:* ").append(data.getReservationDate()).append("\n");
        message.append("• *Hora:* ").append(data.getReservationTime()).append("\n");
        message.append("• *Comensales:* ").append(data.getGuestCount()).append(" personas\n");
        message.append("• *Mesa:* ").append(data.getTableInfo()).append("\n\n");
        
        if ("presencial".equals(data.getPaymentType())) {
            message.append("💰 *RECUERDA:* Tienes pago pendiente de S/ ");
            message.append(String.format("%.2f", data.getTotalAmount())).append("\n\n");
        }
        
        message.append("📍 *UBICACIÓN:* Av. Principal 123, Lima\n");
        message.append("📞 *Teléfono:* (01) 234-5678\n\n");
        message.append("¡Te esperamos! ✨");
        
        return message.toString();
    }

    /**
     * Envía notificación de cancelación
     */
    public boolean sendCancellationNotification(String customerPhone, ReservationNotificationData data) {
        try {
            String message = buildCancellationMessage(data);
            return sendWhatsAppMessage(customerPhone, message);
        } catch (Exception e) {
            log.error("Error enviando notificación de cancelación por WhatsApp: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Construye mensaje de cancelación
     */
    private String buildCancellationMessage(ReservationNotificationData data) {
        StringBuilder message = new StringBuilder();
        message.append("❌ *RESERVA CANCELADA - MARAKOS GRILL* ❌\n\n");
        message.append("Hola ").append(data.getCustomerName()).append(",\n\n");
        message.append("Tu reserva ha sido *CANCELADA*\n\n");
        message.append("📋 *DETALLES DE LA RESERVA CANCELADA:*\n");
        message.append("• *ID:* ").append(data.getReservationCode()).append("\n");
        message.append("• *Fecha:* ").append(data.getReservationDate()).append("\n");
        message.append("• *Hora:* ").append(data.getReservationTime()).append("\n\n");
        
        if (data.getTotalAmount() > 0) {
            message.append("💰 *REEMBOLSO:* Se procesará en 3-5 días hábiles\n\n");
        }
        
        message.append("Si tienes alguna consulta, contáctanos:\n");
        message.append("📞 (01) 234-5678\n\n");
        message.append("¡Esperamos verte pronto! 🍽️");
        
        return message.toString();
    }
}