package com.example.m1dwa.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "leaderboard")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Leaderboard {

    @Id
    private Long userId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    @JsonIgnore
    @lombok.ToString.Exclude
    @lombok.EqualsAndHashCode.Exclude
    private User user;

    @Column(nullable = false)
    private long totalClicks = 0;

    @Column(nullable = false)
    private long totalEntitiesGenerated = 0;

    @Column(nullable = false)
    private long totalMoneySpent = 0;

    @Column(nullable = false)
    private long totalMoneyGenerated = 0;

    @Column(nullable = false)
    private long pixelsOnMap = 0;

    @Column(nullable = false)
    private long currentMoneys = 0;

    @Column(nullable = false)
    private long pixelRecord = 0;
}
