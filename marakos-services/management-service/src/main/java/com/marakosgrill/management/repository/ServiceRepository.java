package com.marakosgrill.management.repository;

import com.marakosgrill.management.model.ServiceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ServiceRepository extends JpaRepository<ServiceEntity, Integer> {
    // Custom queries if needed
}
