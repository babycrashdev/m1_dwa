package com.example.m1dwa.repository;

import com.example.m1dwa.model.PastelOwnership;
import com.example.m1dwa.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PastelOwnershipRepository extends JpaRepository<PastelOwnership, Long> {
    boolean existsByUserAndColorCode(User user, String colorCode);

    List<PastelOwnership> findByUserUsername(String username);
}
