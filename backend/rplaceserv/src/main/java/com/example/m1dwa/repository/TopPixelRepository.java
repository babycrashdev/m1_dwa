package com.example.m1dwa.repository;

import com.example.m1dwa.dto.LeaderboardTopPixelDTO;
import com.example.m1dwa.model.Pixel;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TopPixelRepository extends JpaRepository<Pixel, Long> {
    
    @Query("SELECT new com.example.m1dwa.dto.LeaderboardTopPixelDTO(u.username, COUNT(p)) " +
           "FROM Pixel p JOIN p.lastModifiedBy u " +
           "GROUP BY u.username " +
           "ORDER BY COUNT(p) DESC")
    List<LeaderboardTopPixelDTO> findTopPixelPlacers(Pageable pageable);
}
