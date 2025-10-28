package com.marakosgrill.payment.service.impl;

import com.marakosgrill.payment.dto.PaymentRequest;
import com.marakosgrill.payment.dto.PaymentResponse;
import com.marakosgrill.payment.model.Transaction;
import com.marakosgrill.payment.repository.TransactionRepository;
import com.marakosgrill.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.marakosgrill.payment.util.constant.PAYMENT_STATUS_PAID;
import static com.marakosgrill.payment.util.constant.PAYMENT_STATUS_REJECTED;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {
    private final TransactionRepository transactionRepository;

    @Override
    @Transactional
    public PaymentResponse processPayment(PaymentRequest request) {
        Transaction transaction = transactionRepository.findById(request.getTransactionId())
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        if (!transaction.getReservationId().equals(request.getReservationId())) {
            throw new RuntimeException("Reservation ID does not match transaction");
        }
        // Simulate payment gateway response
        boolean paymentSuccess = Math.random() > 0.3; // 70% success rate
        String newStatus = paymentSuccess ? PAYMENT_STATUS_PAID : PAYMENT_STATUS_REJECTED;
        transaction.setStatus(newStatus);
        transaction.setPaymentMethod(request.getPaymentMethod());
        transaction.setUpdatedBy(request.getCreatedBy());
        transaction.setUpdatedAt(java.time.LocalDateTime.now());
        transactionRepository.save(transaction);

        return PaymentResponse.builder()
                .transactionId(transaction.getId())
                .reservationId(transaction.getReservationId())
                .paymentDate(transaction.getPaymentDate())
                .paymentMethod(transaction.getPaymentMethod())
                .amount(transaction.getAmount())
                .status(transaction.getStatus())
                .externalTransactionId(transaction.getExternalTransactionId())
                .build();
    }
}

