package com.example.m1dwa.repository;

import com.example.m1dwa.model.Upgrade;
import com.example.m1dwa.model.UpgradeType;
import com.example.m1dwa.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UpgradeRepository extends JpaRepository<Upgrade, Long> {
    List<Upgrade> findByUser(User user);
    Optional<Upgrade> findByUserAndType(User user, UpgradeType type);
    Optional<Upgrade> findByUserUsernameAndType(String username, UpgradeType type);
}
