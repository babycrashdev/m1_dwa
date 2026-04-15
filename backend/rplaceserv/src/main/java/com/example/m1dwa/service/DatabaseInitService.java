package com.example.m1dwa.service;

import com.example.m1dwa.model.Pixel;
import com.example.m1dwa.repository.PixelRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DatabaseInitService {

    private final PixelRepository pixelRepository;

    @PostConstruct
    public void init() {
        if (pixelRepository.count() == 0) {
            log.info("Initialisation de la grille");
            
            List<Pixel> pixels = new ArrayList<>();
            for (int x = 0; x < 100; x++) {
                for (int y = 0; y < 100; y++) {
                    pixels.add(new Pixel(x, y, "#FFFFFF"));
                }
                
                // Sauvegarde par tranches de 10 lignes pour la mémoire
                if (pixels.size() >= 1000) {
                    pixelRepository.saveAll(pixels);
                    pixels.clear();
                    log.info("Tranche sauvegardée");
                }
            }
            
            if (!pixels.isEmpty()) {
                pixelRepository.saveAll(pixels);
            }
            
            log.info("Initialisation de la grille faite");
        } else {
            log.info("Grille déjà initialisée");
        }
    }
}
