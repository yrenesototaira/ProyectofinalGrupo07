package com.marakosgrill.management.repository;

import com.marakosgrill.management.model.TableEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TableRepository extends JpaRepository<TableEntity, Integer> {
    // Custom queries if needed
}

