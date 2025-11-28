package com.marakosgrill.reservation.repository;

import com.marakosgrill.reservation.model.ReservationProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReservationProductRepository extends JpaRepository<ReservationProduct, Integer> {
    List<ReservationProduct> findByReservation_Id(Integer reservationId);
}
