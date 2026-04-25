package com.example.m1dwa.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "upgrades")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Upgrade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UpgradeType type;

    @Column(nullable = false)
    private int level = 0;

    @Column(nullable = false)
    private int efficiencyLevel = 0;

    @Column(nullable = false)
    private int productionLevel = 0;
}
