package com.example.m1dwa.repository;

import com.example.m1dwa.model.BleuPastel;
import com.example.m1dwa.model.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BleuPastelRepository extends JpaRepository<BleuPastel, Long> {
    Optional<BleuPastel> findByUserUsername(String username);
    boolean existsByUser(User user);
}
