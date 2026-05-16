package com.example.m1dwa.config;

import lombok.Data;

@Data
public class ClickerConfig {
    private long syncIntervalMs;
    private long baseCarValue;

    private Integer maxSlots;
    private boolean firstSlotFree;
    private long slotBasePrice;
    private double slotPriceMultiplier;
}
