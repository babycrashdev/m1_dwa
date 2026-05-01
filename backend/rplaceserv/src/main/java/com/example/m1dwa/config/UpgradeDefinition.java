package com.example.m1dwa.config;

import lombok.Data;
import java.util.Map;

@Data
public class UpgradeDefinition {
    private String category;
    private long basePrice;
    private double priceMultiplier;
    private long baseIntervalMs;
    private long baseProduction;
    private long bonusValueBonus;
    private BoostDefinition boosts;
    private Map<String, SubUpgradeDefinition> upgrades;

    @Data
    public static class BoostDefinition {
        private long durationMs;
        private long cooldownMs;
        private long increaseDurationMs;
    }

    @Data
    public static class SubUpgradeDefinition {
        private long basePrice;
        private double priceMultiplier;
        private Long reductionPerLevelMs;
        private Long increasePerLevel;
    }
}
