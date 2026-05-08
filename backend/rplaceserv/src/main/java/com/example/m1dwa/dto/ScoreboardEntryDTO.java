package com.example.m1dwa.dto;

public record ScoreboardEntryDTO(
    String username,
    String country,
    long moneys,
    int totalUpgradeLevels,
    int unlockedSlots
) {}
