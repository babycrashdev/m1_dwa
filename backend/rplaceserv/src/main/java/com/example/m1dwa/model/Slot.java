package com.example.m1dwa.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.EqualsAndHashCode.Exclude;
import lombok.ToString.Exclude;
import lombok.com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDateTime;

@Entity
@Table(name = "slots", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "slotIndex"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Slot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @JsonIgnore
    private User user;

    @Column(nullable = false)
    private int slotIndex;

    @Column(nullable = false)
    private boolean unlocked = false;

    @Column(nullable = true)
    private String buildingType;

    @Column(nullable = true)
    private LocalDateTime lastBoostAt;

    @Column(nullable = true)
    private LocalDateTime lastAutoBonusAt;

    @Column(nullable = false)
    private boolean parcelPresent = false;
}
