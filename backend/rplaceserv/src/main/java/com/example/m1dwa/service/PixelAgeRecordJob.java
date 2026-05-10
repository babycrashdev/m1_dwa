package com.example.m1dwa.service;

import com.example.m1dwa.model.Pixel;
import com.example.m1dwa.repository.PixelRepository;
import com.example.m1dwa.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class PixelAgeRecordJob {

    private final PixelRepository pixelRepository;
    private final WalletRepository walletRepository;
    
    // On update toutes les min
    @Scheduled(fixedRate = 60_000)
    @Transactional
    public void updatePixelAgeRecords() {
        LocalDateTime now = LocalDateTime.now();
        List<Pixel> allPixels = pixelRepository.findAll();

        // Calcul du record généré par IA ---
        Map<Long, Long> bestAgeByUserId = new HashMap<>();

        for (Pixel pixel : allPixels) {
            if (pixel.getLastModifiedBy() == null || pixel.getLastModifiedAt() == null) continue;

            long userId = pixel.getLastModifiedBy().getId();
            long ageMs = Duration.between(pixel.getLastModifiedAt(), now).toSeconds();

            bestAgeByUserId.merge(userId, ageMs, Math::max);
        }
        
        // On met a jour la bdd
        int updated = 0;
        for (Map.Entry<Long, Long> entry : bestAgeByUserId.entrySet()) {
            int rows = walletRepository.updatePixelRecordIfBetter(entry.getKey(), entry.getValue());
            if (rows > 0) updated++;
        }
    }
}
