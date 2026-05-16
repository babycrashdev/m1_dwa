package com.example.m1dwa.service;

import com.example.m1dwa.dto.PixelDTO;
import com.example.m1dwa.model.Pixel;
import com.example.m1dwa.repository.PixelRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DatabaseInitService {

    private final PixelRepository pixelRepository;
    private final GameConfigService gameConfigService;

    @PostConstruct
    public void init() {
        int gridSize = gameConfigService.getRplaceConfig().getGridSize();
        log.info("Vérification de la grille (taille cible: {}x{})", gridSize, gridSize);


        List<PixelDTO> existing = pixelRepository.findAllSimplified(gridSize);
        Set<String> coords = existing.stream()
                .map(p -> p.x() + "," + p.y())
                .collect(Collectors.toSet());

        List<Pixel> toAdd = new ArrayList<>();
        int count = 0;

        for (int x = 0; x < gridSize; x++) {
            for (int y = 0; y < gridSize; y++) {
                if (!coords.contains(x + "," + y)) {
                    toAdd.add(new Pixel(x, y, "#FFFFFF"));
                }

                // Sauvegarde par tranches de 1000 pixels pour la mémoire
                if (toAdd.size() >= 1000) {
                    pixelRepository.saveAll(toAdd);
                    count += toAdd.size();
                    toAdd.clear();
                    log.info("Initialisation en cours... {} pixels créés", count);
                }
            }
        }

        if (!toAdd.isEmpty()) {
            count += toAdd.size();
            pixelRepository.saveAll(toAdd);
        }

        if (count > 0) {
            log.info("Vérification terminée : {} nouveaux pixels créés.", count);
        } else {
            log.info("La grille est déjà complète pour la taille {}x{}.", gridSize, gridSize);
        }
    }
}


