package com.example.m1dwa.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "pastel_ownerships")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PastelOwnership {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 7)
    private String colorCode;

    public PastelOwnership(User user, String colorCode) {
        this.user = user;
        this.colorCode = colorCode.toUpperCase();
    }
}
