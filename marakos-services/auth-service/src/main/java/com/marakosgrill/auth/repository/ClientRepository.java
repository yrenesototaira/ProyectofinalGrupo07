package com.marakosgrill.auth.repository;

import com.marakosgrill.auth.model.Client;
import com.marakosgrill.auth.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {
    Optional<Client> findByUser(User user);
    Optional<Client> findByUserId(Long userId);
}
