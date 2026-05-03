package com.example.m1dwa.controller;

import com.example.m1dwa.dto.PixelDTO;
import com.example.m1dwa.repository.PixelRepository;
import com.example.m1dwa.service.GameConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PixelController {

    private final PixelRepository pixelRepository;
    private final GameConfigService gameConfigService;

    @GetMapping("/pixels")
    public List<PixelDTO> getAllPixels() {
        int gridSize = gameConfigService.getRplaceConfig().getGridSize();
        return pixelRepository.findAllSimplified(gridSize);
    }

    @GetMapping("/config/rplace")
    public Map<String, Object> getRPlaceConfig() {
        int gridSize = gameConfigService.getRplaceConfig().getGridSize();
        return Map.of("gridSize", gridSize);
    }
}
