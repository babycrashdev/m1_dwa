package com.example.m1dwa.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "colors")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Colors {

    @Id
    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private User user;

    @Column(nullable = false)
    private boolean color1 = false;

    @Column(nullable = false)
    private boolean color2 = false;

    @Column(nullable = false)
    private boolean color3 = false;

    public Colors(User user) {
        this.user = user;
        this.color1 = false;
        this.color2 = false;
        this.color3 = false;
    }
}
