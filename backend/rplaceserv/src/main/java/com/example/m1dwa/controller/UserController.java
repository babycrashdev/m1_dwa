package com.example.m1dwa.controller;

import com.example.m1dwa.model.User;
import com.example.m1dwa.model.Wallet;
import com.example.m1dwa.repository.WalletRepository;
import com.example.m1dwa.repository.UserRepository;
import com.example.m1dwa.service.PixelService;
import com.example.m1dwa.service.ScoreboardService;
import com.example.m1dwa.service.UserStatsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import com.example.m1dwa.dto.UserUpdateDTO;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody UserUpdateDTO updateDTO, Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username).orElse(null);

        if (user == null) {
            return ResponseEntity.status(404).body("Utilisateur non trouvé");
        }

        if (updateDTO.password() != null && !updateDTO.password().isEmpty()
                && !updateDTO.password().equals("********")) {
            user.setPassword(passwordEncoder.encode(updateDTO.password()));
        }
        user.setAge(updateDTO.age());
        user.setCountry(updateDTO.country());

        userRepository.save(user);

        return ResponseEntity.ok("Profil mis à jour avec succès");
    }

    @Autowired
    private PixelService pixelService;

    @Autowired
    private ScoreboardService scoreboardService;

    @Autowired
    private UserStatsService userStatsService;

    @GetMapping("/{username}/stats")
    public ResponseEntity<?> getUserStats(@PathVariable String username) {
        try {
            return ResponseEntity.ok(userStatsService.getStatsDTO(username));
        } catch (Exception e) {
            return ResponseEntity.status(404).body("Utilisateur non trouvé");
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username).orElse(null);

        if (user == null) {
            return ResponseEntity.status(404).body("Utilisateur non trouvé");
        }

        // TODO: Securieter pour la phase de developpement (Initialisation d'un wallet pour les user deja creer)
        Wallet wallet = walletRepository.findByUserUsername(username).orElseGet(() -> {
            Wallet newWallet = new Wallet();
            newWallet.setUser(user);
            newWallet.setMoneys(0);
            return walletRepository.save(newWallet);
        });

        return ResponseEntity.ok(Map.of(
            "username", user.getUsername(),
            "age", user.getAge(),
            "country", user.getCountry(),
            "moneys", wallet.getMoneys(),
            "pixelRecord", scoreboardService.getRecord(user, wallet.getPixelRecordSeconds())
        ));
    }
}
