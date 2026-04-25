package com.example.m1dwa.dto;

import java.time.LocalDateTime;

public record PixelDTO(int x, int y, String color, long price, String ownerName, LocalDateTime lastModifiedAt) {
}
