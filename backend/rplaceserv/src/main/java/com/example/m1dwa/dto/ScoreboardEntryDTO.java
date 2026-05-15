package com.example.m1dwa.dto;

public record ScoreboardEntryDTO(
    String username,
    String country,
    int age,
    long moneys,
    long totalPixels,
    long pixelRecord
) {}
