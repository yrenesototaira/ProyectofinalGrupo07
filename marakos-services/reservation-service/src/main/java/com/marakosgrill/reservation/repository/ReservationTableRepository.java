package com.marakosgrill.reservation.repository;

import com.marakosgrill.reservation.model.ReservationTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ReservationTableRepository extends JpaRepository<ReservationTable, Integer> {
    List<ReservationTable> findByReservation_ReservationDateAndActiveTrueAndReservation_StatusNot(LocalDate date, String excludedStatus);
    List<ReservationTable> findByReservation_Id(Integer reservationId);
}
