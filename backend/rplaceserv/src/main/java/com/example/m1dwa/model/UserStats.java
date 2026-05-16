package com.example.m1dwa.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "user_stats")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserStats {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    @lombok.ToString.Exclude
    @lombok.EqualsAndHashCode.Exclude
    @JsonIgnore
    private User user;

    @Column(nullable = false)
    private long totalPixelsPlaced = 0;

    @Column(nullable = false)
    private long timesOverwritten = 0;

    @Column(nullable = false)
    private long totalClicks = 0;

    @Column(nullable = false)
    private long totalParcelsGenerated = 0;

    @Column(nullable = false)
    private long totalMoneyGenerated = 0;

    @Column(nullable = false)
    private long totalMoneySpent = 0;

    @Column(nullable = false)
    private long mostExpensivePixelPrice = 0;

    @Column(nullable = false)
    private long totalGameTimeSeconds = 0;

    public UserStats(User user) {
        this.user = user;
    }
}
