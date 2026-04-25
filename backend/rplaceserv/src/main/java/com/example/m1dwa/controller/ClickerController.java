package com.example.m1dwa.controller;

import com.example.m1dwa.repository.WalletRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/user/clicker")
public class ClickerController {

    private static final Logger logger = LoggerFactory.getLogger(ClickerController.class);

    @Autowired
    private WalletRepository walletRepository;

    @PostMapping("/sync")
    /* Aider par l'IA pour faire fonctionner correctement */
    public ResponseEntity<?> syncClickerData(@RequestBody Map<String, Long> payload, Authentication authentication) {
        String username = authentication.getName();
        Long increment = payload.get("increment");

        if (increment == null || increment < 0) {
            return ResponseEntity.badRequest().body("Argument d'increment invalide");
        }

        logger.debug("Synchronisation pour {}: +{} moneys", username, increment);

        int updated = walletRepository.incrementMoneys(username, increment);

        if (updated == 0) {
            return ResponseEntity.status(404).body("Utilisateur ou portefeuille introuvable");
        }

        long currentMoneys = walletRepository.findByUserUsername(username)
                .map(wallet -> wallet.getMoneys())
                .orElse(0L);

        return ResponseEntity.ok(Map.of("moneys", currentMoneys));
    }
}
