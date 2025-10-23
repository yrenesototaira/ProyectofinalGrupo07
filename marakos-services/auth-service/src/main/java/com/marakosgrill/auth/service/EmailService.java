package com.marakosgrill.auth.service;

import jakarta.mail.MessagingException;

public interface EmailService {
    void sendEmail(String to, String subject, String body);
    void sendEmailHtml(String to, String subject, String htmlBody) throws MessagingException;
}

