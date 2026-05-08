package com.example.m1dwa.controller;

import com.example.m1dwa.model.GameTip;
import com.example.m1dwa.service.GameConfigService;
import com.example.m1dwa.service.TipService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/config")
@RequiredArgsConstructor
public class ConfigController {

    private final GameConfigService gameConfigService;
    private final TipService tipService;

    @GetMapping("/rplace")
    public ResponseEntity<?> getRPlaceConfig() {
        return ResponseEntity.ok(Map.of(
            "gridSize", gameConfigService.getRplaceConfig().getGridSize()
        ));
    }

    @GetMapping("/clicker")
    public ResponseEntity<?> getClickerConfig() {
        return ResponseEntity.ok(Map.of(
            "global", gameConfigService.getClickerConfig(),
            "upgrades", gameConfigService.getUpgrades()
        ));
    }

    @GetMapping("/tips")
    public ResponseEntity<?> getTips() {
        return ResponseEntity.ok(Map.of(
            "defaultTime", tipService.getDefaultTime(),
            "tips", tipService.getAllTips()
        ));
    }
}
