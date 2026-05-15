package com.example.m1dwa.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LeaderboardDTO {
    private String username;
    private String country;
    private Integer age;
    private long totalClicks;
    private long totalEntitiesGenerated;
    private long totalMoneySpent;
    private long totalMoneyGenerated;
    private long pixelsOnMap;
    private long currentMoneys;
    private long pixelRecord;
}
