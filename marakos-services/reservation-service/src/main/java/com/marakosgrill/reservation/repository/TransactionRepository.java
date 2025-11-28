package com.marakosgrill.reservation.repository;

import com.marakosgrill.reservation.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Integer> {
    List<Transaction> findByReservation_Id(Integer reservationId);
}
