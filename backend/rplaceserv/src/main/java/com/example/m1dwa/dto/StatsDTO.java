package com.example.m1dwa.dto;

import java.time.LocalDateTime;

public record StatsDTO(
    long totalPixelsPlaced,
    long timesOverwritten,
    long totalClicks,
    long totalParcelsGenerated,
    long totalMoneyGenerated,
    long totalMoneySpent,
    long mostExpensivePixelPrice,
    long totalGameTimeSeconds,
    LocalDateTime oldestActivePixelDate,
    long activePixelsCount,
    long pixelRecordSeconds
) {}
