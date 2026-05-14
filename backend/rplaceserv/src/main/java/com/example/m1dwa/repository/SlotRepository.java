package com.example.m1dwa.repository;

import com.example.m1dwa.model.Slot;
import com.example.m1dwa.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SlotRepository extends JpaRepository<Slot, Long> {
    List<Slot> findByUser(User user);
    List<Slot> findByUserOrderBySlotIndexAsc(User user);
    Optional<Slot> findByUserAndSlotIndex(User user, int slotIndex);
}
