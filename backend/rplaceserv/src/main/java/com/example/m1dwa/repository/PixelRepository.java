package com.example.m1dwa.repository;

import com.example.m1dwa.dto.PixelDTO;
import com.example.m1dwa.model.Pixel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PixelRepository extends JpaRepository<Pixel, Long> {
    Optional<Pixel> findByXAndY(int x, int y);

    // Requête optimisée pour récupérer tous les pixels sous forme de DTO (proposé par l'IA, à vérifier)
    @Query("SELECT new com.example.m1dwa.dto.PixelDTO(p.x, p.y, p.color, p.price, u.username, p.lastModifiedAt) " +
           "FROM Pixel p LEFT JOIN p.lastModifiedBy u " +
           "WHERE p.x < :size AND p.y < :size")
    List<PixelDTO> findAllSimplified(int size);

    boolean existsByXAndY(int x, int y);
}
