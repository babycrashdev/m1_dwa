package com.example.m1dwa.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "brush")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Brush {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 3)
    private String brushUpgrade;

    public Brush(User user, String brushUpgrade) {
        this.user = user;
        this.brushUpgrade = brushUpgrade;
    }
}
