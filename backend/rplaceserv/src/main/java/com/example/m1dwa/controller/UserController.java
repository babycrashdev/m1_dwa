package com.example.m1dwa.controller;

import com.example.m1dwa.model.User;
import com.example.m1dwa.model.Wallet;
import com.example.m1dwa.repository.WalletRepository;
import com.example.m1dwa.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private com.example.m1dwa.repository.PixelRepository pixelRepository;

    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile(Authentication authentication) {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username).orElse(null);

        if (user == null) {
            return ResponseEntity.status(404).body("Utilisateur non trouvé");
        }

        Wallet wallet = walletRepository.findByUserUsername(username).orElseGet(() -> {
            Wallet newWallet = new Wallet();
            newWallet.setUser(user);
            newWallet.setMoneys(0);
            return walletRepository.save(newWallet);
        });

        long pixelCount = pixelRepository.countByLastModifiedByUsername(username);

        return ResponseEntity.ok(new com.example.m1dwa.dto.UserProfileDTO(
            user.getUsername(),
            user.getCountry(),
            user.getAge(),
            wallet.getMoneys(),
            pixelCount
        ));
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
            "moneys", wallet.getMoneys()
        ));
    }
}
