// Généré à l'aide de l'IA

package com.example.m1dwa.service;

import com.example.m1dwa.dto.ScoreboardEntryDTO;
import com.example.m1dwa.model.User;
import com.example.m1dwa.model.Wallet;
import com.example.m1dwa.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.context.annotation.Lazy;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ScoreboardService {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final PixelRepository pixelRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final ClickerService clickerService;

    public ScoreboardService(
            UserRepository userRepository,
            WalletRepository walletRepository,
            UpgradeRepository upgradeRepository,
            SlotRepository slotRepository,
            PixelRepository pixelRepository,
            SimpMessagingTemplate messagingTemplate,
            @Lazy ClickerService clickerService) {
        this.userRepository = userRepository;
        this.walletRepository = walletRepository;
        this.upgradeRepository = upgradeRepository;
        this.slotRepository = slotRepository;
        this.pixelRepository = pixelRepository;
        this.messagingTemplate = messagingTemplate;
        this.clickerService = clickerService;
    }

    public void pushScoreboard() {
        List<ScoreboardEntryDTO> entries = getScoreboardEntries();

        messagingTemplate.convertAndSend("/topic/scoreboard", Map.of(
            "type", "full",
            "entries", entries
        ));
    }

    public List<ScoreboardEntryDTO> getScoreboardEntries() {
        List<User> users = userRepository.findAll();
        return users.stream().map(user -> {
            Wallet wallet = user.getWallet();
            long moneys = (wallet != null) ? wallet.getMoneys() : 0L;
            long historicalRecord = (wallet != null) ? wallet.getPixelRecordSeconds() : 0L;
            
            var upgrades = upgradeRepository.findByUser(user);
            var slots = slotRepository.findByUserOrderBySlotIndexAsc(user);

            int totalUpgradeLevels = upgrades.stream()
                .mapToInt(u -> u.getLevel() + u.getEfficiencyLevel() + u.getProductionLevel())
                .sum();
            int unlockedSlots = (int) slots.stream()
                .filter(s -> s.isUnlocked()).count();
            long totalPixels = pixelRepository.countByLastModifiedBy(user);
            
            double passiveIncome = clickerService.calculatePassiveIncome(upgrades);
            long clickBonus = clickerService.calculateTotalClickValue(upgrades, slots);

            return new ScoreboardEntryDTO(
                user.getUsername(),
                user.getCountry(),
                user.getAge(),
                moneys,
                totalPixels,
                getRecord(user, historicalRecord),
                passiveIncome,
                clickBonus
            );
        }).collect(Collectors.toList());
    }

    public long getRecord(User user, long historicalRecord) {
        return pixelRepository.findOldestPixelDateByUser(user)
            .map(oldestDate -> {
                long currentSurvival = Duration.between(oldestDate, LocalDateTime.now()).getSeconds();
                return Math.max(historicalRecord, currentSurvival);
            })
            .orElse(historicalRecord);
    }
}
