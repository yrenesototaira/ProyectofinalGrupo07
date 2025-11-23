package com.marakosgrill.auth.service;

import jakarta.mail.MessagingException;

public interface EmailService {
    void sendEmail(String to, String subject, String body);
    void sendEmailHtml(String to, String subject, String htmlBody) throws MessagingException;
    void sendReservationConfirmationEmail(String to, String customerName, String reservationCode, 
                                         String reservationDate, String reservationTime, 
                                         int peopleCount, String customerEmail, String customerPhone) throws MessagingException;
}

