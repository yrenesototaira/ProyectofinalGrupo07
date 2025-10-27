package com.marakosgrill.auth.repository;

import com.marakosgrill.auth.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByActiveTrue();
    List<User> findByActiveTrueOrderByCreatedAtDesc();
    
    // Paginación
    Page<User> findByActiveTrueOrderByCreatedAtDesc(Pageable pageable);
    
    // Búsqueda con paginación - JOIN con tablas cliente y empleado
    @Query("SELECT DISTINCT u FROM User u " +
           "LEFT JOIN Client c ON c.user.id = u.id " +
           "LEFT JOIN Employee e ON e.user.id = u.id " +
           "LEFT JOIN e.role r " +
           "WHERE u.active = true AND " +
           "(LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(e.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(e.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(r.nombre) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(u.userType.name) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY u.createdAt DESC")
    Page<User> findByActiveTrueAndSearchOrderByCreatedAtDesc(@Param("search") String search, Pageable pageable);
}