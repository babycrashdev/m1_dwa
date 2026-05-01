package com.example.m1dwa.service;


import com.example.m1dwa.config.RPlaceConfig;
import com.example.m1dwa.config.ClickerConfig;
import com.example.m1dwa.config.UpgradeDefinition;
import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Service;
import org.yaml.snakeyaml.Yaml;
import org.yaml.snakeyaml.constructor.Constructor;

import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@Getter
public class GameConfigService {

    private RPlaceConfig rplaceConfig;
    private ClickerConfig clickerConfig;
    private final Map<String, UpgradeDefinition> upgrades = new HashMap<>();

    @PostConstruct
    public void loadConfigs() {
        Yaml yaml = new Yaml();
        
        try (InputStream is = getClass().getClassLoader().getResourceAsStream("config.yml")) {
            if (is != null) {
                Map<String, Object> data = yaml.load(is);
                
                Map<String, Object> rplace = (Map<String, Object>) data.get("rplace");
                rplaceConfig = new RPlaceConfig();
                rplaceConfig.setGridSize((Integer) rplace.get("gridSize"));
                rplaceConfig.setInitialPrice(Long.valueOf(rplace.get("initialPrice").toString()));
                rplaceConfig.setPixelPriceIncrement(Long.valueOf(rplace.get("pixelPriceIncrement").toString()));

                Map<String, Object> clicker = (Map<String, Object>) data.get("clicker");
                clickerConfig = new ClickerConfig();
                clickerConfig.setSyncIntervalMs(Long.valueOf(clicker.get("syncIntervalMs").toString()));
                clickerConfig.setBaseCarValue(Long.valueOf(clicker.get("baseCarValue").toString()));
                
                log.info("Configuration générale chargée : gridSize={}", rplaceConfig.getGridSize());
            }
        } catch (Exception e) {
            log.error("Erreur lors du chargement de config.yml", e);
        }

        try {
            PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
            Resource[] resources = resolver.getResources("classpath:upgrades/*.yml");
            
            for (Resource resource : resources) {
                String filename = resource.getFilename();
                if (filename != null) {
                    String type = filename.replace(".yml", "").toUpperCase();
                    try (InputStream is = resource.getInputStream()) {
                        Map<String, Object> raw = yaml.load(is);
                        String rootKey = filename.replace(".yml", "");
                        Map<String, Object> content = (Map<String, Object>) raw.get(rootKey);
                        
                        UpgradeDefinition def = mapToUpgradeDefinition(content);
                        upgrades.put(type, def);
                        
                        log.info("Upgrade chargée : {} (basePrice={})", type, def.getBasePrice());
                    }
                }
            }
        } catch (Exception e) {
            log.error("Erreur lors du chargement des upgrades", e);
        }
    }

    private UpgradeDefinition mapToUpgradeDefinition(Map<String, Object> map) {
        UpgradeDefinition def = new UpgradeDefinition();
        def.setCategory(map.getOrDefault("category", "DEFAULT").toString());
        def.setBasePrice(Long.valueOf(map.get("basePrice").toString()));
        def.setPriceMultiplier(Double.valueOf(map.get("priceMultiplier").toString()));
        def.setBaseIntervalMs(Long.valueOf(map.get("baseIntervalMs").toString()));
        def.setBaseProduction(Long.valueOf(map.get("baseProduction").toString()));
        
        Map<String, Map<String, Object>> rawUpgrades = (Map<String, Map<String, Object>>) map.get("upgrades");
        Map<String, UpgradeDefinition.SubUpgradeDefinition> subUpgrades = new HashMap<>();
        
        if (rawUpgrades != null) {
            for (Map.Entry<String, Map<String, Object>> entry : rawUpgrades.entrySet()) {
                UpgradeDefinition.SubUpgradeDefinition sub = new UpgradeDefinition.SubUpgradeDefinition();
                Map<String, Object> subMap = entry.getValue();
                sub.setBasePrice(Long.valueOf(subMap.get("basePrice").toString()));
                sub.setPriceMultiplier(Double.valueOf(subMap.get("priceMultiplier").toString()));

                if (subMap.containsKey("reductionPerLevelMs")) {
                    sub.setReductionPerLevelMs(Long.valueOf(subMap.get("reductionPerLevelMs").toString()));
                }

                if (subMap.containsKey("increasePerLevel")) {
                    sub.setIncreasePerLevel(Long.valueOf(subMap.get("increasePerLevel").toString()));
                }

                subUpgrades.put(entry.getKey(), sub);
            }
        }

        def.setUpgrades(subUpgrades);

        return def;
    }
}
