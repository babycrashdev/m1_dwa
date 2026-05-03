package com.example.m1dwa.service;

import com.example.m1dwa.dto.PixelDTO;
import com.example.m1dwa.dto.PlacePixelRequest;
import com.example.m1dwa.model.Pixel;
import com.example.m1dwa.model.User;
import com.example.m1dwa.model.Wallet;
import com.example.m1dwa.repository.PixelRepository;
import com.example.m1dwa.repository.UserRepository;
import com.example.m1dwa.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class PixelService {

    private final PixelRepository pixelRepository;
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;

    @Value("${rplace.grid.size}")
    private int gridSize;

    @Value("${rplace.pixel.initial-price}")
    private long initialPrice;

    @Value("${rplace.pixel.price-increment}")
    private long priceIncrement;

    @Transactional
    public PixelDTO placePixel(PlacePixelRequest request, String username) {
        return placePixels(java.util.List.of(request), username).stream().findFirst().orElse(null);
    }

    @Transactional
    public java.util.List<PixelDTO> placePixels(java.util.List<PlacePixelRequest> requests, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé: " + username));

        LocalDateTime now = LocalDateTime.now();
        if (user.getLastPixelPlacedAt() != null && user.getLastPixelPlacedAt().plusSeconds(5).isAfter(now)) {
            log.warn("Cooldown actif pour l'utilisateur {}", username);
            return java.util.Collections.emptyList();
        }

        Wallet wallet = walletRepository.findByUserUsername(username)
                .orElseThrow(() -> new RuntimeException("Wallet non trouvé pour l'utilisateur " + username));

        int minX = Integer.MAX_VALUE, maxX = Integer.MIN_VALUE;
        int minY = Integer.MAX_VALUE, maxY = Integer.MIN_VALUE;
        for (PlacePixelRequest r : requests) {
            minX = Math.min(minX, r.x());
            maxX = Math.max(maxX, r.x());
            minY = Math.min(minY, r.y());
            maxY = Math.max(maxY, r.y());
        }

        java.util.List<Pixel> existingPixels = pixelRepository.findAllInArea(minX, maxX, minY, maxY);
        java.util.Map<String, Pixel> pixelMap = new java.util.HashMap<>();
        for (Pixel p : existingPixels) {
            pixelMap.put(p.getX() + "," + p.getY(), p);
        }

        java.util.List<PixelDTO> placedPixels = new java.util.ArrayList<>();
        java.util.List<Pixel> pixelsToSave = new java.util.ArrayList<>();

        for (PlacePixelRequest request : requests) {
            if (request.x() < 0 || request.x() >= gridSize || request.y() < 0 || request.y() >= gridSize) {
                log.error("Coordonnées invalides pour {}: {}, {}", username, request.x(), request.y());
                continue;
            }

            String key = request.x() + "," + request.y();
            Pixel pixel = pixelMap.getOrDefault(key, new Pixel(request.x(), request.y(), "#FFFFFF"));

            long currentPrice = (pixel.getPrice() > 0) ? pixel.getPrice() : initialPrice;

            if (wallet.getMoneys() < currentPrice) {
                log.warn("Solde insuffisant pour {} au pixel ({}, {}): {} < {}", username, request.x(), request.y(),
                        wallet.getMoneys(), currentPrice);
                break;
            }

            wallet.setMoneys(wallet.getMoneys() - currentPrice);

            pixel.setColor(request.color());
            pixel.setLastModifiedBy(user);
            pixel.setLastModifiedAt(now);
            pixel.setPrice(currentPrice + priceIncrement);

            pixelsToSave.add(pixel);

            placedPixels.add(new PixelDTO(
                    pixel.getX(),
                    pixel.getY(),
                    pixel.getColor(),
                    pixel.getPrice(),
                    user.getUsername(),
                    pixel.getLastModifiedAt()));
        }

        if (!placedPixels.isEmpty()) {
            pixelRepository.saveAll(pixelsToSave);
            walletRepository.save(wallet);
            user.setLastPixelPlacedAt(now);
            userRepository.save(user);
            log.info("{} pixels placés par {} (total déduit: {})", placedPixels.size(), username, placedPixels.size());
        }

        return placedPixels;
    }
}
