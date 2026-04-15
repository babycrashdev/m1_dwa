package com.example.m1dwa.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "pixels")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Pixel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private int x;

    @Column(nullable = false)
    private int y;

    @Column(nullable = false)
    private String color;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User lastModifiedBy;

    @Column(nullable = true)
    private LocalDateTime lastModifiedAt;

    public Pixel(int x, int y, String color) {
        this.x = x;
        this.y = y;
        this.color = color;
    }
}
