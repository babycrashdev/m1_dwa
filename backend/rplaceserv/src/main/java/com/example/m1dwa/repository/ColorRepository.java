package com.example.m1dwa.repository;

import com.example.m1dwa.model.Color;
import com.example.m1dwa.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ColorRepository extends JpaRepository<Color, Long> {
    boolean existsByUserAndColorCode(User user, String colorCode);
    List<Color> findByUserUsername(String username);
}
