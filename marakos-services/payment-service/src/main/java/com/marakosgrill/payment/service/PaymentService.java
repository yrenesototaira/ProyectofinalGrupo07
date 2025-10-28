package com.marakosgrill.payment.service;

import com.marakosgrill.payment.dto.PaymentRequest;
import com.marakosgrill.payment.dto.PaymentResponse;

public interface PaymentService {
    PaymentResponse processPayment(PaymentRequest request);
}

