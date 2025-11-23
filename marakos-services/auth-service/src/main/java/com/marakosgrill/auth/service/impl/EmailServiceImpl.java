package com.marakosgrill.auth.service.impl;

import com.marakosgrill.auth.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.file.Files;

@Service
public class EmailServiceImpl implements EmailService {

    private static final String COMPANY_NAME = "Marakos Grill";
    private static final String RESERVATION_EMAIL_TEMPLATE = "templates/reservation_confirmation_email.html";
    private static final String RESERVATION_EMAIL_SUBJECT = "Confirmación de Reserva - Marakos Grill";

    @Autowired
    private JavaMailSender mailSender;

    @Override
    public void sendEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }

    @Override
    public void sendEmailHtml(String to, String subject, String htmlBody) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, "utf-8");
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlBody, true);
        mailSender.send(message);
    }

    @Override
    public void sendReservationConfirmationEmail(String to, String customerName, String reservationCode,
                                                  String reservationDate, String reservationTime,
                                                  int peopleCount, String customerEmail, String customerPhone) throws MessagingException {
        String htmlBody = loadReservationConfirmationTemplate(customerName, reservationCode, reservationDate, 
                                                              reservationTime, peopleCount, customerEmail, customerPhone);
        sendEmailHtml(to, RESERVATION_EMAIL_SUBJECT, htmlBody);
    }

    private String loadReservationConfirmationTemplate(String customerName, String reservationCode,
                                                       String reservationDate, String reservationTime,
                                                       int peopleCount, String customerEmail, String customerPhone) {
        try {
            ClassPathResource resource = new ClassPathResource(RESERVATION_EMAIL_TEMPLATE);
            String template = Files.readString(resource.getFile().toPath());
            return template
                    .replace("${customerName}", customerName)
                    .replace("${reservationCode}", reservationCode)
                    .replace("${reservationDate}", reservationDate)
                    .replace("${reservationTime}", reservationTime)
                    .replace("${peopleCount}", String.valueOf(peopleCount))
                    .replace("${customerEmail}", customerEmail)
                    .replace("${customerPhone}", customerPhone)
                    .replace("${companyName}", COMPANY_NAME);
        } catch (Exception e) {
            throw new RuntimeException("Error loading reservation confirmation email template", e);
        }
    }
}

