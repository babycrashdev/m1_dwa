package com.example.m1dwa.repository;

import com.example.m1dwa.model.VertPastel;
import com.example.m1dwa.model.User;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VertPastelRepository extends JpaRepository<VertPastel, Long> {
    Optional<VertPastel> findByUserUsername(String username);

    boolean existsByUser(User user);
}
