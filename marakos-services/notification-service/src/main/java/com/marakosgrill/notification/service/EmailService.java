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
            return template
                    .replace("${customerName}", data.getCustomerName())
                    .replace("${reservationCode}", data.getReservationCode())
                    .replace("${reservationDate}", data.getReservationDate().toString())
                    .replace("${reservationTime}", data.getReservationTime())
                    .replace("${peopleCount}", String.valueOf(data.getGuestCount()))
                    .replace("${customerEmail}", data.getCustomerEmail())
                    .replace("${customerPhone}", data.getCustomerPhone())
                    .replace("${companyName}", COMPANY_NAME);
        } catch (Exception e) {
            log.error("Error loading reservation confirmation email template: {}", e.getMessage(), e);
            throw new RuntimeException("Error loading reservation confirmation email template", e);
        }
    }
}
