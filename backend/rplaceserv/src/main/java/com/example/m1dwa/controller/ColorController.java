package com.example.m1dwa.controller;

import com.example.m1dwa.service.ColorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user/rplace/colors")
@RequiredArgsConstructor
public class ColorController {

    private final ColorService colorService;

    @PostMapping("/buy")
    public ResponseEntity<?> buyColor(@RequestBody Map<String, String> payload, Authentication authentication) {
        String colorHex = payload.get("color");
        String username = authentication.getName();

        String result = colorService.buyColor(username, colorHex);

        if (result.equals("Achat réussi !")) {
            return ResponseEntity.ok(Map.of("message", result));
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", result));
        }
    }

    @GetMapping("/owned")
    public ResponseEntity<?> getOwnedColors(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(colorService.getOwnedColors(username));
    }
}
