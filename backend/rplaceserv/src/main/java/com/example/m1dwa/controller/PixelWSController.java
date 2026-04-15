package com.example.m1dwa.controller;

import com.example.m1dwa.dto.PixelDTO;
import com.example.m1dwa.dto.PlacePixelRequest;
import com.example.m1dwa.model.Pixel;
import com.example.m1dwa.model.User;
import com.example.m1dwa.repository.PixelRepository;
import com.example.m1dwa.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.util.Optional;

@Controller
@RequiredArgsConstructor
@Slf4j
public class PixelWSController {

    private final PixelRepository pixelRepository;
    private final UserRepository userRepository;

    @MessageMapping("/place")
    @SendTo("/topic/board")
    public PixelDTO handlePlacePixel(PlacePixelRequest request, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            log.error("Utilisateur non authentifié");
            return null; 
        }

        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé: " + username));

        if (request.x() < 0 || request.x() >= 100 || request.y() < 0 || request.y() >= 100) {
            log.error("Coordonnées invalides: {}, {}", request.x(), request.y());
            return null;
        }

        LocalDateTime now = LocalDateTime.now();
        if (user.getLastPixelPlacedAt() != null && user.getLastPixelPlacedAt().plusSeconds(5).isAfter(now)) {
            log.warn("L'utilisateur {} en cooldown", username);
            return null;
        }

        Optional<Pixel> pixelOpt = pixelRepository.findByXAndY(request.x(), request.y());
        Pixel pixel;
        if (pixelOpt.isPresent()) {
            pixel = pixelOpt.get();
            pixel.setColor(request.color());
            pixel.setLastModifiedBy(user);
            pixel.setLastModifiedAt(now);
        } else {
            pixel = new Pixel(request.x(), request.y(), request.color());
            pixel.setLastModifiedBy(user);
            pixel.setLastModifiedAt(now);
        }

        pixelRepository.save(pixel);

        user.setLastPixelPlacedAt(now);
        userRepository.save(user);

        log.info("Pixel ({}, {}) couleur {} posé par {}", request.x(), request.y(), request.color(), username);

        return new PixelDTO(pixel.getX(), pixel.getY(), pixel.getColor());
    }
}
