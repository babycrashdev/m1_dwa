package com.example.m1dwa.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "upgrades", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "type"})
})
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

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private int level = 0;

    @Column(nullable = false)
    private int efficiencyLevel = 0;

    @Column(nullable = false)
    private int productionLevel = 0;

    @Column(nullable = true)
    private LocalDateTime lastBoostAt;

    @Column(nullable = true)
    private LocalDateTime lastAutoBonusAt;
}
