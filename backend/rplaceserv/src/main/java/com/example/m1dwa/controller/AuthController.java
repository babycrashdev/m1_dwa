package com.example.m1dwa.controller;

import com.example.m1dwa.model.User;
import com.example.m1dwa.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody User loginRequest) {
        logger.info("Received login request for user: {}", loginRequest.getUsername());
        
        return userRepository.findByUsername(loginRequest.getUsername())
            .map(user -> {
                if (user.getPassword().equals(loginRequest.getPassword())) {
                    logger.info("Authentication successful for user: {}", user.getUsername());
                    return ResponseEntity.ok("Connexion réussie");
                } else {
                    logger.warn("Authentication failed for user: {} (Incorrect password)", loginRequest.getUsername());
                    return ResponseEntity.status(401).body("Mot de passe incorrect");
                }
            })
            .orElseGet(() -> {
                logger.warn("Authentication failed for user: {} (User not found)", loginRequest.getUsername());
                return ResponseEntity.status(404).body("Utilisateur non trouvé");
            });
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        logger.info("Registering new user: {}", user.getUsername());
        
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            logger.warn("Registration failed: Username {} already exists", user.getUsername());
            return ResponseEntity.status(400).body("Ce pseudo est déjà pris");
        }

        userRepository.save(user);
        logger.info("User registered successfully: {}", user.getUsername());
        return ResponseEntity.ok("Utilisateur enregistré");
    }
}
