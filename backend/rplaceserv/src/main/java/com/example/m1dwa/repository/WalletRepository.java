package com.example.m1dwa.repository;

import com.example.m1dwa.model.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface WalletRepository extends JpaRepository<Wallet, Long> {
    Optional<Wallet> findByUserUsername(String username);
    
    @Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT w FROM Wallet w WHERE w.user.username = :username")
    Optional<Wallet> findByUserUsernameWithLock(@Param("username") String username);



    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    /*Requête SQL faite avec l'aide de l'IA */
    @Query(value = "UPDATE wallets SET moneys = moneys + :amount WHERE user_id = :userId", nativeQuery = true)
    int incrementMoneys(@Param("userId") Long userId, @Param("amount") long amount);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Transactional
    /*Requête SQL faite avec l'aide de l'IA */
    @Query(value = "UPDATE wallets SET moneys = moneys - :amount WHERE user_id = :userId AND moneys >= :amount", nativeQuery = true)
    int decrementMoneys(@Param("userId") Long userId, @Param("amount") long amount);
}


