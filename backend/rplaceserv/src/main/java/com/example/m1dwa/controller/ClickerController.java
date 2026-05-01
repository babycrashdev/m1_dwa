/* Aider par l'IA pour structurer et faire fonctionner correctement */
package com.example.m1dwa.controller;

import com.example.m1dwa.dto.ClickerStateDTO;
import com.example.m1dwa.service.ClickerService;
import com.example.m1dwa.service.GameConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ClickerController {

    private final ClickerService clickerService;
    private final GameConfigService gameConfigService;

    @GetMapping("/config/clicker")
    public ResponseEntity<?> getClickerConfig() {
        return ResponseEntity.ok(Map.of(
            "global", gameConfigService.getClickerConfig(),
            "upgrades", gameConfigService.getUpgrades()
        ));
    }

    @GetMapping("/user/clicker/state")
    public ResponseEntity<ClickerStateDTO> getPlayerState(Authentication authentication) {
        return ResponseEntity.ok(clickerService.getClickerState(authentication.getName()));
    }

    @PostMapping("/user/clicker/upgrade")
    public ResponseEntity<ClickerStateDTO> upgrade(
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        
        String type = request.get("type");
        String subType = request.get("subType");
        
        return ResponseEntity.ok(clickerService.upgrade(authentication.getName(), type, subType));
    }

    @PostMapping("/user/clicker/sync")
    public ResponseEntity<?> syncMoneys(
            @RequestBody Map<String, Long> request,
            Authentication authentication) {
        
        Long amount = request.get("amount");
        if (amount != null && amount > 0) {
            clickerService.syncMoneys(authentication.getName(), amount);
        }
        return ResponseEntity.ok().build();
    }

    @PostMapping("/user/clicker/boost")
    public ResponseEntity<ClickerStateDTO> activateBoost(
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        
        String type = request.get("type");
        return ResponseEntity.ok(clickerService.activateBoost(authentication.getName(), type));
    }
}
