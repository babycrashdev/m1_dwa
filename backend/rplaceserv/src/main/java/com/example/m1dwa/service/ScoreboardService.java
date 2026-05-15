// Généré à l'aide de l'IA

package com.example.m1dwa.service;

import com.example.m1dwa.dto.ScoreboardEntryDTO;
import com.example.m1dwa.model.User;
import com.example.m1dwa.model.Wallet;
import com.example.m1dwa.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScoreboardService {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final PixelRepository pixelRepository;
    private final SimpMessagingTemplate messagingTemplate;

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
            
            long totalPixels = pixelRepository.countByLastModifiedBy(user);
            
            return new ScoreboardEntryDTO(
                user.getUsername(),
                user.getCountry(),
                user.getAge(),
                moneys,
                totalPixels,
                getRecord(user, historicalRecord)
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
