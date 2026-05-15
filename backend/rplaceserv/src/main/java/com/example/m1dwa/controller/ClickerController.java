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
@RequestMapping("/api/user/clicker")
@RequiredArgsConstructor
public class ClickerController {

    private final ClickerService clickerService;
    private final GameConfigService gameConfigService;

    @GetMapping("/state")
    public ResponseEntity<ClickerStateDTO> getPlayerState(Authentication authentication) {
        return ResponseEntity.ok(clickerService.getClickerState(authentication.getName()));
    }

    @PostMapping("/upgrade")
    public ResponseEntity<ClickerStateDTO> upgrade(
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        
        String type = request.get("type");
        String subType = request.get("subType");
        
        return ResponseEntity.ok(clickerService.upgrade(authentication.getName(), type, subType));
    }

    @PostMapping("/sync")
    public ResponseEntity<?> syncMoneys(
            @RequestBody Map<String, Long> request,
            Authentication authentication) {
        
        Long amount = request.get("amount");
        Long clicks = request.getOrDefault("clicks", 0L);
        Long entities = request.getOrDefault("entities", 0L);
        
        if (amount != null && amount > 0) {
            clickerService.syncMoneys(authentication.getName(), amount, clicks, entities);
        }
        return ResponseEntity.ok().build();
    }
}
