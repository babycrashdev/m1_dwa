package com.example.m1dwa.repository;

import com.example.m1dwa.model.Leaderboard;
import com.example.m1dwa.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LeaderboardRepository extends JpaRepository<Leaderboard, Long> {
    Optional<Leaderboard> findByUser(User user);

    /*Requête SQL faite avec l'aide de l'IA */
    @Modifying
    @Query("UPDATE Leaderboard l SET l.totalClicks = l.totalClicks + :amount WHERE l.userId = :userId")
    void incrementClicks(@Param("userId") Long userId, @Param("amount") long amount);

    @Modifying
    @Query("UPDATE Leaderboard l SET l.totalMoneyGenerated = l.totalMoneyGenerated + :amount WHERE l.userId = :userId")
    void incrementMoneyGenerated(@Param("userId") Long userId, @Param("amount") long amount);

    @Modifying
    @Query("UPDATE Leaderboard l SET l.totalMoneySpent = l.totalMoneySpent + :amount WHERE l.userId = :userId")
    void incrementMoneySpent(@Param("userId") Long userId, @Param("amount") long amount);

    @Modifying
    @Query("UPDATE Leaderboard l SET l.totalBuildingsGenerated = l.totalBuildingsGenerated + :amount WHERE l.userId = :userId")
    void incrementBuildingsGenerated(@Param("userId") Long userId, @Param("amount") long amount);
}
