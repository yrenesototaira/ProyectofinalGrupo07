package com.marakosgrill.notification.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.file.Files;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private static final String COMPANY_NAME = "Marakos Grill";
    private static final String RESERVATION_EMAIL_TEMPLATE = "templates/reservation_confirmation_email.html";
    private static final String RESERVATION_EMAIL_SUBJECT = "Confirmación de Reserva - Marakos Grill";

    private final JavaMailSender mailSender;

    /**
     * Envía email de confirmación de reserva
     */
    public boolean sendReservationConfirmationEmail(ReservationNotificationData data) {
        try {
            log.info("📧 INICIO EmailService.sendReservationConfirmationEmail");
            log.info("📋 Enviando email de confirmación para reserva: {}", data.getReservationCode());
            log.info("📮 Email destino: {}, Cliente: {}", data.getCustomerEmail(), data.getCustomerName());

            String htmlBody = loadReservationConfirmationTemplate(data);
            sendEmailHtml(data.getCustomerEmail(), RESERVATION_EMAIL_SUBJECT, htmlBody);

            log.info("✅ Email enviado exitosamente para reserva: {}", data.getReservationCode());
            return true;
        } catch (Exception e) {
            log.error("❌ Error enviando email de confirmación para reserva {}: {}", 
                    data.getReservationCode(), e.getMessage(), e);
            return false;
        } finally {
            log.info("🏁 FIN EmailService.sendReservationConfirmationEmail");
        }
    }

    private void sendEmailHtml(String to, String subject, String htmlBody) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, "utf-8");
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlBody, true);
        mailSender.send(message);
    }

    private String loadReservationConfirmationTemplate(ReservationNotificationData data) {
        try {
            ClassPathResource resource = new ClassPathResource(RESERVATION_EMAIL_TEMPLATE);
            String template = Files.readString(resource.getFile().toPath());
            
            // Generar URL del código QR
            String qrData = String.format("{\"reservationId\":%d,\"code\":\"%s\",\"customerName\":\"%s\",\"date\":\"%s\",\"time\":\"%s\"}",
                    data.getReservationId() != null ? data.getReservationId() : 0,
                    data.getReservationCode(),
                    data.getCustomerName(),
                    data.getReservationDate(),
                    data.getReservationTime());
            String qrUrl = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" + 
                          java.net.URLEncoder.encode(qrData, "UTF-8");
            
            // Determinar tipo de reserva
            String reservationType = data.getReservationType() != null ? data.getReservationType() : "MESA";
            boolean isEvent = "EVENTO".equalsIgnoreCase(reservationType);
            
            // Determinar si es pago presencial
            boolean isPresentialPayment = "presencial".equalsIgnoreCase(data.getPaymentType()) || 
                                         "PENDIENTE".equalsIgnoreCase(data.getPaymentStatus());
            
            // Determinar si mostrar monto
            boolean showAmount = (data.getHasPreOrder() != null && data.getHasPreOrder()) || isEvent;
            String amountSection = "";
            if (showAmount && data.getTotalAmount() != null && data.getTotalAmount() > 0) {
                // Si es pago presencial, mostrar estado pendiente con diseño consistente
                if (isPresentialPayment) {
                    amountSection = String.format(
                        "<tr><td style='padding:12px;background-color:#f8f9fa;border:1px solid #e9ecef;font-weight:bold;color:#495057;'>Estado del Pago</td>" +
                        "<td style='padding:12px;background-color:#f8f9fa;border:1px solid #e9ecef;color:#f59e0b;font-weight:bold;font-size:16px;'>Pendiente de Pago Presencial</td></tr>" +
                        "<tr><td style='padding:12px;background-color:#f8f9fa;border:1px solid #e9ecef;font-weight:bold;color:#495057;'>Monto a Pagar</td>" +
                        "<td style='padding:12px;background-color:#ffffff;border:1px solid #e9ecef;color:#f59e0b;font-weight:bold;font-size:18px;'>S/ %.2f</td></tr>",
                        data.getTotalAmount()
                    );
                } else {
                    // Pago online completado - mostrar estado PAGADO
                    amountSection = String.format(
                        "<tr><td style='padding:12px;background-color:#f8f9fa;border:1px solid #e9ecef;font-weight:bold;color:#495057;'>Estado del Pago</td>" +
                        "<td style='padding:12px;background-color:#f8f9fa;border:1px solid #e9ecef;color:#10b981;font-weight:bold;font-size:16px;'>✓ PAGADO</td></tr>" +
                        "<tr><td style='padding:12px;background-color:#f8f9fa;border:1px solid #e9ecef;font-weight:bold;color:#495057;'>Monto Total</td>" +
                        "<td style='padding:12px;background-color:#ffffff;border:1px solid #e9ecef;color:#f59e0b;font-weight:bold;font-size:18px;'>S/ %.2f</td></tr>",
                        data.getTotalAmount()
                    );
                }
            }
            
            // Aviso de 24 horas para pago presencial con diseño mejorado
            String paymentWarning = "";
            if (isPresentialPayment && showAmount) {
                paymentWarning = "<div style='background-color:#fef3c7;border:1px solid #f59e0b;border-radius:4px;padding:12px;margin:20px 0;'>" +
                                "<p style='margin:0;color:#92400e;font-size:13px;line-height:1.5;font-weight:600;'>" +
                                "⏰ IMPORTANTE: Si no pagas en 24 horas, tu reserva se cancelará automáticamente" +
                                "</p></div>";
            }
            
            // Generar detalle de productos si hay pre-orden
            String orderDetails = "";
            if (data.getOrderItems() != null && !data.getOrderItems().isEmpty()) {
                StringBuilder orderHtml = new StringBuilder();
                orderHtml.append("<div style='margin:25px 0;'>");
                orderHtml.append("<h4 style='margin:0 0 12px 0;color:#333;font-size:14px;font-weight:bold;'>DETALLE DE PRE-ORDEN</h4>");
                orderHtml.append("<table style='width:100%;border-collapse:collapse;border:1px solid #e0e0e0;'>");
                orderHtml.append("<thead>");
                orderHtml.append("<tr style='background-color:#f5f5f5;'>");
                orderHtml.append("<th style='padding:8px;text-align:left;font-size:12px;color:#666;border-bottom:1px solid #e0e0e0;'>Producto</th>");
                orderHtml.append("<th style='padding:8px;text-align:center;font-size:12px;color:#666;border-bottom:1px solid #e0e0e0;'>Cant.</th>");
                orderHtml.append("<th style='padding:8px;text-align:right;font-size:12px;color:#666;border-bottom:1px solid #e0e0e0;'>Precio Unit.</th>");
                orderHtml.append("<th style='padding:8px;text-align:right;font-size:12px;color:#666;border-bottom:1px solid #e0e0e0;'>Subtotal</th>");
                orderHtml.append("</tr>");
                orderHtml.append("</thead>");
                orderHtml.append("<tbody>");
                
                for (ReservationNotificationData.OrderItem item : data.getOrderItems()) {
                    orderHtml.append("<tr>");
                    orderHtml.append(String.format("<td style='padding:8px;font-size:13px;color:#555;border-bottom:1px solid #f0f0f0;'>%s</td>", item.getProductName()));
                    orderHtml.append(String.format("<td style='padding:8px;text-align:center;font-size:13px;color:#555;border-bottom:1px solid #f0f0f0;'>%d</td>", item.getQuantity()));
                    orderHtml.append(String.format("<td style='padding:8px;text-align:right;font-size:13px;color:#555;border-bottom:1px solid #f0f0f0;'>S/ %.2f</td>", item.getUnitPrice()));
                    orderHtml.append(String.format("<td style='padding:8px;text-align:right;font-size:13px;color:#555;border-bottom:1px solid #f0f0f0;'>S/ %.2f</td>", item.getSubtotal()));
                    orderHtml.append("</tr>");
                }
                
                orderHtml.append("</tbody>");
                orderHtml.append("</table>");
                orderHtml.append("</div>");
                orderDetails = orderHtml.toString();
            }
            
            // Título según tipo de reserva
            String reservationTypeTitle = isEvent ? "Reserva de Evento" : "Reserva de Mesa";
            
            return template
                    .replace("${customerName}", data.getCustomerName())
                    .replace("${reservationCode}", data.getReservationCode())
                    .replace("${reservationDate}", data.getReservationDate().toString())
                    .replace("${reservationTime}", data.getReservationTime())
                    .replace("${peopleCount}", String.valueOf(data.getGuestCount()))
                    .replace("${customerEmail}", data.getCustomerEmail())
                    .replace("${customerPhone}", data.getCustomerPhone())
                    .replace("${companyName}", COMPANY_NAME)
                    .replace("${qrCodeUrl}", qrUrl)
                    .replace("${amountSection}", amountSection)
                    .replace("${paymentWarning}", paymentWarning)
                    .replace("${orderDetails}", orderDetails)
                    .replace("${reservationType}", reservationTypeTitle);
        } catch (Exception e) {
            log.error("Error loading reservation confirmation email template: {}", e.getMessage(), e);
            throw new RuntimeException("Error loading reservation confirmation email template", e);
        }
    }
}
