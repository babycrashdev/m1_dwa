package com.example.m1dwa.repository;

import com.example.m1dwa.dto.PixelDTO;
import com.example.m1dwa.model.Pixel;
import com.example.m1dwa.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

@Repository
public interface PixelRepository extends JpaRepository<Pixel, Long> {
    Optional<Pixel> findByXAndY(int x, int y);

    /*Requête SQL faite avec l'aide de l'IA (Désolé madame Lacayrelle) */
    @Query("SELECT new com.example.m1dwa.dto.PixelDTO(p.x, p.y, p.color, p.price, u.username, p.lastModifiedAt) " +
           "FROM Pixel p LEFT JOIN p.lastModifiedBy u " +
           "WHERE p.x < :size AND p.y < :size")
    List<PixelDTO> findAllSimplified(int size);

    /*Requête SQL faite avec l'aide de l'IA */
    @Query("SELECT p FROM Pixel p WHERE p.x >= :minX AND p.x <= :maxX AND p.y >= :minY AND p.y <= :maxY")
    List<Pixel> findAllInArea(@Param("minX") int minX, @Param("maxX") int maxX, @Param("minY") int minY, @Param("maxY") int maxY);
    
    /*Requête SQL faite avec l'aide de l'IA */
    @Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Pixel p WHERE p.x >= :minX AND p.x <= :maxX AND p.y >= :minY AND p.y <= :maxY")
    List<Pixel> findAllInAreaWithLock(@Param("minX") int minX, @Param("maxX") int maxX, @Param("minY") int minY, @Param("maxY") int maxY);



    boolean existsByXAndY(int x, int y);
    long countByLastModifiedBy(User user);
}
