// Généré à l'aide de l'IA

package com.example.m1dwa.service;

import com.example.m1dwa.dto.ScoreboardEntryDTO;
import com.example.m1dwa.model.User;
import com.example.m1dwa.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScoreboardService {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final UpgradeRepository upgradeRepository;
    private final SlotRepository slotRepository;
    private final PixelRepository pixelRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public void pushScoreboard() {
        List<User> users = userRepository.findAll();
        List<ScoreboardEntryDTO> entries = users.stream().map(user -> {
            long moneys = walletRepository.findByUserUsername(user.getUsername())
                .map(w -> w.getMoneys()).orElse(0L);
            int totalUpgradeLevels = upgradeRepository.findByUser(user).stream()
                .mapToInt(u -> u.getLevel() + u.getEfficiencyLevel() + u.getProductionLevel())
                .sum();
            int unlockedSlots = (int) slotRepository.findByUser(user).stream()
                .filter(s -> s.isUnlocked()).count();
            long totalPixels = pixelRepository.countByLastModifiedBy(user);
            return new ScoreboardEntryDTO(
                user.getUsername(),
                user.getCountry(),
                moneys,
                totalUpgradeLevels,
                unlockedSlots,
                totalPixels,
                getRecord(user)
            );
        }).collect(Collectors.toList());

        messagingTemplate.convertAndSend("/topic/scoreboard", Map.of(
            "type", "full",
            "entries", entries
        ));
    }

    private long getRecord(User user) {
        long savedRecord = user.getPixelRecordSeconds();
        long currentBest = pixelRepository.findByLastModifiedBy(user).stream()
            .mapToLong(p -> java.time.Duration.between(p.getLastModifiedAt(), java.time.LocalDateTime.now()).getSeconds())
            .max()
            .orElse(0);
        return Math.max(savedRecord, currentBest);
    }
}
