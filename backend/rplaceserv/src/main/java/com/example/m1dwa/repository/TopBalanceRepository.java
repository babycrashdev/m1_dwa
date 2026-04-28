package com.example.m1dwa.repository;

import com.example.m1dwa.dto.LeaderboardTopBalanceDTO;
import com.example.m1dwa.model.Wallet;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TopBalanceRepository extends JpaRepository<Wallet, Long> {
    
    @Query("SELECT new com.example.m1dwa.dto.LeaderboardTopBalanceDTO(u.username, w.moneys) " +
           "FROM Wallet w JOIN w.user u " +
           "ORDER BY w.moneys DESC")
    List<LeaderboardTopBalanceDTO> findTopBalances(Pageable pageable);
}
