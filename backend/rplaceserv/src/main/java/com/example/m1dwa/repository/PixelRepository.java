package com.example.m1dwa.repository;

import com.example.m1dwa.model.Pixel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PixelRepository extends JpaRepository<Pixel, Long> {
    Optional<Pixel> findByXAndY(int x, int y);
}
