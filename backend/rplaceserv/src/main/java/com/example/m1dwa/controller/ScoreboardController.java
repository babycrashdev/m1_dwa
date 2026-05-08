package com.example.m1dwa.controller;

import com.example.m1dwa.dto.ScoreboardEntryDTO;
import com.example.m1dwa.model.User;
import com.example.m1dwa.repository.UserRepository;
import com.example.m1dwa.repository.WalletRepository;
import com.example.m1dwa.repository.UpgradeRepository;
import com.example.m1dwa.repository.SlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ScoreboardController {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final UpgradeRepository upgradeRepository;
    private final SlotRepository slotRepository;

    @GetMapping("/scoreboard")
    public ResponseEntity<List<ScoreboardEntryDTO>> getScoreboard() {
        List<User> users = userRepository.findAll();

        List<ScoreboardEntryDTO> entries = users.stream().map(user -> {
            long moneys = walletRepository.findByUserUsername(user.getUsername())
                .map(w -> w.getMoneys())
                .orElse(0L);

            int totalUpgradeLevels = upgradeRepository.findByUser(user).stream()
                .mapToInt(u -> u.getLevel() + u.getEfficiencyLevel() + u.getProductionLevel())
                .sum();

            int unlockedSlots = (int) slotRepository.findByUser(user).stream()
                .filter(s -> s.isUnlocked())
                .count();

            return new ScoreboardEntryDTO(
                user.getUsername(),
                user.getCountry(),
                moneys,
                totalUpgradeLevels,
                unlockedSlots
            );
        }).collect(Collectors.toList());

        return ResponseEntity.ok(entries);
    }
}
