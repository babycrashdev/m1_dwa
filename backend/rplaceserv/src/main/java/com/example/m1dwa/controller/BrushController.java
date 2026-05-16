package com.example.m1dwa.controller;

import com.example.m1dwa.service.BrushService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user/rplace/brushes")
@RequiredArgsConstructor
public class BrushController {

    private final BrushService brushService;

    @PostMapping("/buy")
    public ResponseEntity<?> buyBrush(@RequestBody Map<String, String> payload, Authentication authentication) {
        String upgrade = payload.get("upgrade");
        String username = authentication.getName();

        String result = brushService.buyUpgrade(username, upgrade);

        if (result.equals("Achat réussi !")) {
            return ResponseEntity.ok(Map.of("message", result));
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", result));
        }
    }

    @GetMapping("/owned")
    public ResponseEntity<?> getOwnedBrushes(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(brushService.getOwnedUpgrades(username));
    }
}
