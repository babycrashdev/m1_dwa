package com.example.m1dwa.service;

import com.example.m1dwa.model.User;
import com.example.m1dwa.model.UserStats;
import com.example.m1dwa.model.Wallet;
import com.example.m1dwa.model.Slot;
import com.example.m1dwa.dto.StatsDTO;
import com.example.m1dwa.repository.UserStatsRepository;
import com.example.m1dwa.repository.PixelRepository;
import com.example.m1dwa.repository.UserRepository;
import com.example.m1dwa.repository.WalletRepository;
import com.example.m1dwa.repository.UpgradeRepository;
import com.example.m1dwa.repository.SlotRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserStatsService {

    private final UserStatsRepository userStatsRepository;
    private final PixelRepository pixelRepository;
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final UpgradeRepository upgradeRepository;
    private final SlotRepository slotRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public StatsDTO getStatsDTO(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        UserStats stats = getOrCreateStats(user);
        java.time.LocalDateTime oldestPixel = pixelRepository.findOldestPixelDateByUser(user).orElse(null);
        long activePixels = pixelRepository.countByLastModifiedBy(user);
        long recordSeconds = walletRepository.findByUserUsername(username)
                .map(Wallet::getPixelRecordSeconds)
                .orElse(0L);

        var upgrades = upgradeRepository.findByUser(user);
        int totalUpgradeLevels = upgrades.stream()
                .mapToInt(u -> u.getLevel() + u.getEfficiencyLevel() + u.getProductionLevel())
                .sum();
        
        int unlockedSlots = (int) slotRepository.findByUserOrderBySlotIndexAsc(user).stream()
                .filter(Slot::isUnlocked)
                .count();

        return new StatsDTO(
            stats.getTotalPixelsPlaced(),
            stats.getTimesOverwritten(),
            stats.getTotalClicks(),
            stats.getTotalParcelsGenerated(),
            stats.getTotalMoneyGenerated(),
            stats.getTotalMoneySpent(),
            stats.getMostExpensivePixelPrice(),
            stats.getTotalGameTimeSeconds(),
            oldestPixel,
            activePixels,
            recordSeconds,
            totalUpgradeLevels,
            unlockedSlots
        );
    }

    @Transactional
    public void addPixelsPlaced(User user, int count, long totalCost, long maxPrice) {
        UserStats stats = getOrCreateStats(user);
        stats.setTotalPixelsPlaced(stats.getTotalPixelsPlaced() + count);
        stats.setTotalMoneySpent(stats.getTotalMoneySpent() + totalCost);
        if (maxPrice > stats.getMostExpensivePixelPrice()) {
            stats.setMostExpensivePixelPrice(maxPrice);
        }
        updateGameTime(user, stats);
        userStatsRepository.save(stats);
        pushStats(user);
    }

    @Transactional
    public void addTimesOverwritten(User user, int count) {
        UserStats stats = getOrCreateStats(user);
        stats.setTimesOverwritten(stats.getTimesOverwritten() + count);
        userStatsRepository.save(stats);
        pushStats(user);
    }

    @Transactional
    public void addClickerStats(User user, long moneyGenerated, long clicks, long parcels) {
        UserStats stats = getOrCreateStats(user);
        stats.setTotalMoneyGenerated(stats.getTotalMoneyGenerated() + moneyGenerated);
        stats.setTotalClicks(stats.getTotalClicks() + clicks);
        stats.setTotalParcelsGenerated(stats.getTotalParcelsGenerated() + parcels);
        updateGameTime(user, stats);
        userStatsRepository.save(stats);
        pushStats(user);
    }

    @Transactional
    public void addMoneySpent(User user, long amount) {
        UserStats stats = getOrCreateStats(user);
        stats.setTotalMoneySpent(stats.getTotalMoneySpent() + amount);
        userStatsRepository.save(stats);
        pushStats(user);
    }

    private void updateGameTime(User user, UserStats stats) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime lastPixel = user.getLastPixelPlacedAt();
        LocalDateTime lastSync = user.getLastClickerSyncAt();
        
        LocalDateTime lastActivity = null;
        if (lastPixel != null && lastSync != null) {
            lastActivity = lastPixel.isAfter(lastSync) ? lastPixel : lastSync;
        } else if (lastPixel != null) {
            lastActivity = lastPixel;
        } else if (lastSync != null) {
            lastActivity = lastSync;
        }

        if (lastActivity != null) {
            long diffSeconds = Duration.between(lastActivity, now).getSeconds();
            if (diffSeconds > 0 && diffSeconds < 600) {
                stats.setTotalGameTimeSeconds(stats.getTotalGameTimeSeconds() + diffSeconds);
            }
        }
    }

    public UserStats getOrCreateStats(User user) {
        return userStatsRepository.findByUser(user)
                .orElseGet(() -> userStatsRepository.save(new UserStats(user)));
    }

    private void pushStats(User user) {
        try {
            StatsDTO dto = getStatsDTO(user.getUsername());
            messagingTemplate.convertAndSend("/topic/stats/" + user.getUsername(), dto);
        } catch (Exception e) {
            log.error("Erreur lors du push des stats pour {}", user.getUsername(), e);
        }
    }
}
