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
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé: " + username));

        if (request.x() < 0 || request.x() >= gridSize || request.y() < 0 || request.y() >= gridSize) {
            log.error("Coordonnées invalides pour {}: {}, {}", username, request.x(), request.y());
            return null;
        }

        LocalDateTime now = LocalDateTime.now();
        if (user.getLastPixelPlacedAt() != null && user.getLastPixelPlacedAt().plusSeconds(5).isAfter(now)) {
            log.warn("Cooldown actif pour l'utilisateur {}", username);
            return null;
        }

        Pixel pixel = pixelRepository.findByXAndY(request.x(), request.y())
                .orElseGet(() -> new Pixel(request.x(), request.y(), "#FFFFFF"));

        long currentPrice = (pixel.getPrice() > 0) ? pixel.getPrice() : initialPrice;

        Wallet wallet = walletRepository.findByUserUsername(username)
                .orElseThrow(() -> new RuntimeException("Wallet non trouvé pour l'utilisateur " + username));

        if (wallet.getMoneys() < currentPrice) {
            log.warn("Solde insuffisant pour {}: {} < {}", username, wallet.getMoneys(), currentPrice);
            return null;
        }

        wallet.setMoneys(wallet.getMoneys() - currentPrice);
        walletRepository.save(wallet);

        pixel.setColor(request.color());
        pixel.setLastModifiedBy(user);
        pixel.setLastModifiedAt(now);
        pixel.setPrice(currentPrice + priceIncrement);
        pixelRepository.save(pixel);

        user.setLastPixelPlacedAt(now);
        userRepository.save(user);

        log.info("Pixel ({}, {}) acheté {} par {} (nouveau prix: {})", pixel.getX(), pixel.getY(), currentPrice, username, pixel.getPrice());

        return new PixelDTO(
                pixel.getX(), 
                pixel.getY(), 
                pixel.getColor(), 
                pixel.getPrice(), 
                user.getUsername(), 
                pixel.getLastModifiedAt()
        );
    }
}
