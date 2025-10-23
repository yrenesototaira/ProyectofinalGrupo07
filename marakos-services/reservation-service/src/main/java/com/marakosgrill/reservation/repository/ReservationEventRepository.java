package com.marakosgrill.reservation.repository;

import com.marakosgrill.reservation.model.ReservationEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReservationEventRepository extends JpaRepository<ReservationEvent, Integer> {
}

