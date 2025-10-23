package com.marakosgrill.customer.repository;

import com.marakosgrill.customer.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    // Buscar clientes por estado
    List<Customer> findByStatus(String status);

    // Buscar clientes por nombre o apellido (ignorando mayúsculas/minúsculas)
    List<Customer> findByFirstNameIgnoreCaseContainingOrLastNameIgnoreCaseContaining(String firstName, String lastName);
}

