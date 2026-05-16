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
import java.time.Duration;
import java.util.Collections;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;


@Service
@RequiredArgsConstructor
@Slf4j
public class PixelService {

    private final PixelRepository pixelRepository;
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final GameConfigService gameConfigService;
    private final ScoreboardService scoreboardService;
    private final UserStatsService userStatsService;
    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    @Transactional
    public PixelDTO placePixel(PlacePixelRequest request, String username) {
        return placePixels(List.of(request), username).stream().findFirst().orElse(null);
    }

    @Transactional
    public List<PixelDTO> placePixels(List<PlacePixelRequest> requests, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé: " + username));

        int gridSize = gameConfigService.getRplaceConfig().getGridSize();
        long initialPrice = gameConfigService.getRplaceConfig().getInitialPrice();
        long priceIncrement = gameConfigService.getRplaceConfig().getPixelPriceIncrement();

        LocalDateTime now = LocalDateTime.now();
        if (user.getLastPixelPlacedAt() != null && user.getLastPixelPlacedAt().plusSeconds(5).isAfter(now)) {
            log.warn("Cooldown actif pour l'utilisateur {}", username);
            return Collections.emptyList();
        }

        Wallet wallet = walletRepository.findByUserUsernameWithLock(username)
                .orElseThrow(() -> new RuntimeException("Wallet non trouvé"));

        int minX = Integer.MAX_VALUE, maxX = Integer.MIN_VALUE;
        int minY = Integer.MAX_VALUE, maxY = Integer.MIN_VALUE;
        for (PlacePixelRequest r : requests) {
            minX = Math.min(minX, r.x());
            maxX = Math.max(maxX, r.x());
            minY = Math.min(minY, r.y());
            maxY = Math.max(maxY, r.y());
        }

        List<Pixel> existingPixels = pixelRepository.findAllInAreaWithLock(minX, maxX, minY, maxY);

        Map<String, Pixel> pixelMap = new HashMap<>();
        for (Pixel p : existingPixels) {
            pixelMap.put(p.getX() + "," + p.getY(), p);
        }

        List<PixelDTO> placedPixels = new ArrayList<>();
        List<Pixel> pixelsToSave = new ArrayList<>();
        long totalCost = 0;
        long maxPricePlaced = 0;
        long estimatedBalance = wallet.getMoneys();

        for (PlacePixelRequest request : requests) {
            if (request.x() < 0 || request.x() >= gridSize || request.y() < 0 || request.y() >= gridSize) {
                log.error("Coordonnées invalides pour {}: {}, {}", username, request.x(), request.y());
                continue;
            }

            String key = request.x() + "," + request.y();
            Pixel pixel = pixelMap.getOrDefault(key, new Pixel(request.x(), request.y(), "#FFFFFF"));

            User previousUser = pixel.getLastModifiedBy();
            LocalDateTime lastModified = pixel.getLastModifiedAt();

            long currentPrice = (pixel.getPrice() > 0) ? pixel.getPrice() : initialPrice;

            if (estimatedBalance < currentPrice) {
                log.warn("Solde insuffisant pour {} au pixel ({}, {}): {} < {}", username, request.x(), request.y(),
                        estimatedBalance, currentPrice);
                break;
            }
            if (previousUser != null && lastModified != null) {
                long heldSeconds = Duration.between(lastModified, LocalDateTime.now()).getSeconds();
                if (previousUser.getWallet() != null && heldSeconds > previousUser.getWallet().getPixelRecordSeconds()) {
                    previousUser.getWallet().setPixelRecordSeconds(heldSeconds);
                    walletRepository.save(previousUser.getWallet());
                }
                userStatsService.addTimesOverwritten(previousUser, 1);
            }

            estimatedBalance -= currentPrice;
            totalCost += currentPrice;
            if (currentPrice > maxPricePlaced) maxPricePlaced = currentPrice;

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
            int updated = walletRepository.decrementMoneys(user.getId(), totalCost);
            if (updated == 0) {
                log.error("Échec de la déduction atomique pour {}: solde insuffisant ou conflit", username);
                throw new RuntimeException("Solde insuffisant ou erreur de transaction");
            }
            
            pixelRepository.saveAll(pixelsToSave);
            userStatsService.addPixelsPlaced(user, placedPixels.size(), totalCost, maxPricePlaced);
            messagingTemplate.convertAndSend("/topic/scoreboard", Map.of(
                "type", "refresh"
            ));
            userRepository.updateLastPixelPlacedAt(username, now);
            log.info("{} pixels placés par {} (total déduit: {})", placedPixels.size(), username, totalCost);
        }

        scoreboardService.pushScoreboard();

        return placedPixels;
    }
}
