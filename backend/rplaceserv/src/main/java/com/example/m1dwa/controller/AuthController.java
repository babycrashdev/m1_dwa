/*Source: https://github.com/bezkoder/spring-boot-spring-security-jwt-authentication/tree/master

Debug en partie par IA*/

package com.example.m1dwa.controller;

import com.example.m1dwa.config.JwtUtils;
import com.example.m1dwa.model.User;
import com.example.m1dwa.model.Wallet;
import com.example.m1dwa.model.UserStats;
import com.example.m1dwa.repository.UserRepository;
import com.example.m1dwa.repository.WalletRepository;
import com.example.m1dwa.repository.UserStatsRepository;
import com.example.m1dwa.service.SlotService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private SlotService slotService;

    @Autowired
    private UserStatsRepository userStatsRepository;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody User loginRequest) {
        logger.info("Tentative de connexion pour l'utilisateur: {}", loginRequest.getUsername());
        
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(loginRequest.getUsername());
            
            User user = userRepository.findByUsername(loginRequest.getUsername()).get();
            
            logger.info("Connexion réussie pour: {}", loginRequest.getUsername());
            return ResponseEntity.ok(Map.of(
                "token", jwt,
                "username", user.getUsername(),
                "age", user.getAge(),
                "country", user.getCountry()
            ));
        } catch (Exception e) {
            logger.warn("Échec de connexion : {}", e.getMessage());
            return ResponseEntity.status(401).body("Identifiants incorrects");
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        logger.info("Inscription de l'utilisateur: {}", user.getUsername());
        
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            logger.warn("Échec d'inscription : Pseudo {} déjà utilisé", user.getUsername());
            return ResponseEntity.status(400).body("Ce pseudo est déjà pris");
        }

        user.setPassword(encoder.encode(user.getPassword()));
        userRepository.save(user);
        
        Wallet wallet = new Wallet();
        wallet.setUser(user);
        wallet.setMoneys(0);
        walletRepository.save(wallet);

        UserStats stats = new UserStats(user);
        userStatsRepository.save(stats);

        slotService.initializeSlotsForUser(user);
        
        logger.info("Utilisateur {} enregistré avec succès", user.getUsername());
        return ResponseEntity.ok("Inscription réussie, vous pouvez vous connecter.");
    }
}
