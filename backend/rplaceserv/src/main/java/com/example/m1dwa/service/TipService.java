package com.example.m1dwa.service;

import com.example.m1dwa.model.GameTip;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.yaml.snakeyaml.Yaml;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@Getter
public class TipService {

    private final List<GameTip> tips = new ArrayList<>();
    private int defaultTime = 2000; /* Temps minimum en millisecondes de l'affichage de la page de chargement*/

    @PostConstruct
    /* Utilisation de l'IA pour l'aide à la realisation et surtout le debbugage */
    public void loadTips() {
        Yaml yaml = new Yaml();
        try (InputStream is = getClass().getClassLoader().getResourceAsStream("tips.yml")) {
            if (is != null) {
                Map<String, Object> data = yaml.load(is);

                if (data.containsKey("default_time")) {
                    this.defaultTime = (Integer) data.get("default_time");
                }

                @SuppressWarnings("unchecked")
                List<Map<String, Object>> tipsList = (List<Map<String, Object>>) data.get("tips");
                
                if (tipsList != null) {
                    tips.clear();
                    for (Map<String, Object> tipMap : tipsList) {
                        GameTip tip = new GameTip(
                            (Integer) tipMap.get("id"),
                            (String) tipMap.get("content")
                        );
                        tips.add(tip);
                    }
                    log.info("Chargement réussi de {} conseils depuis tips.yml", tips.size());
                }
            } else {
                log.warn("Fichier tips.yml non trouvé dans le classpath");
            }
        } catch (Exception e) {
            log.error("Erreur lors du chargement de tips.yml", e);
        }
    }

    public List<GameTip> getAllTips() {
        return new ArrayList<>(tips);
    }
}
