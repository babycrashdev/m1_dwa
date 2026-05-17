package com.example.m1dwa.repository;

import com.example.m1dwa.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    @Modifying
    @Transactional
    /*Requête SQL optimisée et refaite avec l'aide de l'IA */
    @Query("UPDATE User u SET u.lastPixelPlacedAt = :now WHERE u.username = :username")
    void updateLastPixelPlacedAt(@Param("username") String username, @Param("now") LocalDateTime now);

    @Modifying
    @Transactional
    /*Requête SQL optimisée et refaite avec l'aide de l'IA */
    @Query("UPDATE User u SET u.lastClickerSyncAt = :now WHERE u.username = :username")
    void updateLastClickerSyncAt(@Param("username") String username, @Param("now") LocalDateTime now);
}


