package com.example.m1dwa.repository;

import com.example.m1dwa.model.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface WalletRepository extends JpaRepository<Wallet, Long> {
    Optional<Wallet> findByUserUsername(String username);

    @Modifying
    @Transactional
    /*Requête SQL faite avec l'aide de l'IA (Désoler madame Lacayrelle) */
    @Query("UPDATE Wallet w SET w.moneys = w.moneys + :amount WHERE w.user.id = (SELECT usr.id FROM User usr WHERE usr.username = :username)")
    int incrementMoneys(@Param("username") String username, @Param("amount") long amount);
}
