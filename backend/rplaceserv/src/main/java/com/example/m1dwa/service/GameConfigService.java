/* Fonctionement repris des plugin minecraft mais aider par l'IA pour l'adapter au projet */

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
                clickerConfig.setMaxSlots((Integer) clicker.get("maxSlots"));
                clickerConfig.setFirstSlotFree((Boolean) clicker.get("firstSlotFree"));
                clickerConfig.setSlotBasePrice(Long.valueOf(clicker.get("slotBasePrice").toString()));
                clickerConfig.setSlotPriceMultiplier(Double.valueOf(clicker.get("slotPriceMultiplier").toString()));

                log.info("Configuration générale chargée : gridSize={}, maxSlots={}", rplaceConfig.getGridSize(), clickerConfig.getMaxSlots());
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
        def.setBasePrice(parseSafeLong(map.get("basePrice"), 0L));
        def.setPriceMultiplier(parseSafeDouble(map.get("priceMultiplier"), 1.0));
        def.setBaseIntervalMs(parseSafeLong(map.get("baseIntervalMs"), 0L));
        def.setBaseProduction(parseSafeLong(map.get("baseProduction"), 0L));
        def.setBonusValueBonus(parseSafeLong(map.get("bonusValueBonus"), 0L));

        if (map.containsKey("boosts")) {
            Map<String, Object> rawBoosts = (Map<String, Object>) map.get("boosts");
            UpgradeDefinition.BoostDefinition boostDef = new UpgradeDefinition.BoostDefinition();
            boostDef.setDurationMs(parseSafeLong(rawBoosts.get("durationMs"), 0L));
            boostDef.setCooldownMs(parseSafeLong(rawBoosts.get("cooldownMs"), 0L));
            boostDef.setIncreaseDurationMs(parseSafeLong(rawBoosts.get("increaseDurationMs"), 0L));
            def.setBoosts(boostDef);
        }
        
        Map<String, Map<String, Object>> rawUpgrades = (Map<String, Map<String, Object>>) map.get("upgrades");
        Map<String, UpgradeDefinition.SubUpgradeDefinition> subUpgrades = new HashMap<>();
        
        if (rawUpgrades != null) {
            for (Map.Entry<String, Map<String, Object>> entry : rawUpgrades.entrySet()) {
                UpgradeDefinition.SubUpgradeDefinition sub = new UpgradeDefinition.SubUpgradeDefinition();
                Map<String, Object> subMap = entry.getValue();
                sub.setBasePrice(parseSafeLong(subMap.get("basePrice"), 0L));
                sub.setPriceMultiplier(parseSafeDouble(subMap.get("priceMultiplier"), 1.0));

                if (subMap.containsKey("reductionPerLevelMs")) {
                    sub.setReductionPerLevelMs(parseSafeLong(subMap.get("reductionPerLevelMs"), 0L));
                }

                if (subMap.containsKey("increasePerLevel")) {
                    sub.setIncreasePerLevel(parseSafeLong(subMap.get("increasePerLevel"), 0L));
                }

                subUpgrades.put(entry.getKey(), sub);
            }
        }

        def.setUpgrades(subUpgrades);
        return def;
    }

    private Long parseSafeLong(Object val, Long defaultVal) {
        if (val == null) return defaultVal;
        try {
            return Long.valueOf(val.toString());
        } catch (Exception e) {
            return defaultVal;
        }
    }

    private Double parseSafeDouble(Object val, Double defaultVal) {
        if (val == null) return defaultVal;
        try {
            return Double.valueOf(val.toString());
        } catch (Exception e) {
            return defaultVal;
        }
    }
}
