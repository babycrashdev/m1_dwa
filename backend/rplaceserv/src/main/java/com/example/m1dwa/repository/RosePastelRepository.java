package com.example.m1dwa.repository;

import com.example.m1dwa.model.RosePastel;
import com.example.m1dwa.model.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RosePastelRepository extends JpaRepository<RosePastel, Long> {
    Optional<RosePastel> findByUserUsername(String username);
    boolean existsByUser(User user);
}
