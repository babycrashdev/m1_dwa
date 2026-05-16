package com.example.m1dwa.repository;

import com.example.m1dwa.model.Brush;
import com.example.m1dwa.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BrushRepository extends JpaRepository<Brush, Long> {
    boolean existsByUserAndBrushUpgrade(User user, String brushUpgrade);
    List<Brush> findByUserUsername(String username);
}
