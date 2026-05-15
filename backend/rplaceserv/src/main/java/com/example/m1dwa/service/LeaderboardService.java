package com.example.m1dwa.service;

import com.example.m1dwa.dto.LeaderboardDTO;
import com.example.m1dwa.model.Leaderboard;
import com.example.m1dwa.model.User;
import com.example.m1dwa.repository.LeaderboardRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LeaderboardService {

    private final LeaderboardRepository leaderboardRepository;
    private final com.example.m1dwa.repository.UserRepository userRepository;
    private final com.example.m1dwa.repository.PixelRepository pixelRepository;

    @Transactional(readOnly = true)
    public List<LeaderboardDTO> getAllEntries() {
        return leaderboardRepository.findAll().stream()
                .map(lb -> {
                    long currentOldest = pixelRepository.findOldestPixelDateByUser(lb.getUser())
                        .map(date -> {
                            long duration = java.time.Duration.between(date, java.time.LocalDateTime.now()).getSeconds();
                            log.info("[Leaderboard] User: {}, Oldest: {}, Duration: {}", lb.getUser().getUsername(), date, duration);
                            return duration;
                        })
                        .orElse(0L);
                    
                    long finalRecord = Math.max(lb.getPixelRecord(), currentOldest);
                    
                    return new LeaderboardDTO(
                        lb.getUser().getUsername(),
                        lb.getUser().getCountry(),
                        lb.getUser().getAge(),
                        lb.getTotalClicks(),
                        lb.getTotalEntitiesGenerated(),
                        lb.getTotalMoneySpent(),
                        lb.getTotalMoneyGenerated(),
                        lb.getPixelsOnMap(),
                        lb.getCurrentMoneys(),
                        finalRecord
                    );
                }).collect(Collectors.toList());
    }

    @Transactional
    public Leaderboard getOrCreate(User user) {
        return leaderboardRepository.findById(user.getId())
                .orElseGet(() -> {
                    Leaderboard lb = new Leaderboard();
                    lb.setUser(user);
                    lb.setUserId(user.getId());
                    if (user.getWallet() != null) {
                        lb.setCurrentMoneys(user.getWallet().getMoneys());
                        lb.setPixelRecord(user.getWallet().getPixelRecordSeconds());
                    }
                    return leaderboardRepository.save(lb);
                });
    }

    @Transactional
    public void trackClicks(Long userId, long count) {
        Leaderboard lb = getOrCreateById(userId);
        if (lb != null) {
            lb.setTotalClicks(lb.getTotalClicks() + count);
            leaderboardRepository.save(lb);
        }
    }

    @Transactional
    public void trackEntities(Long userId, long count) {
        Leaderboard lb = getOrCreateById(userId);
        if (lb != null) {
            lb.setTotalEntitiesGenerated(lb.getTotalEntitiesGenerated() + count);
            leaderboardRepository.save(lb);
        }
    }

    @Transactional
    public void trackMoneySpent(Long userId, long amount) {
        Leaderboard lb = getOrCreateById(userId);
        if (lb != null) {
            lb.setTotalMoneySpent(lb.getTotalMoneySpent() + amount);
            leaderboardRepository.save(lb);
        }
    }

    @Transactional
    public void trackMoneyGenerated(Long userId, long amount) {
        Leaderboard lb = getOrCreateById(userId);
        if (lb != null) {
            lb.setTotalMoneyGenerated(lb.getTotalMoneyGenerated() + amount);
            leaderboardRepository.save(lb);
        }
    }

    @Transactional
    public void updatePixelsOnMap(Long userId, long count) {
        Leaderboard lb = getOrCreateById(userId);
        if (lb != null) {
            lb.setPixelsOnMap(count);
            leaderboardRepository.save(lb);
        }
    }

    @Transactional
    public void syncWallet(Long userId, long currentMoneys, long pixelRecord) {
        Leaderboard lb = getOrCreateById(userId);
        if (lb != null) {
            lb.setCurrentMoneys(currentMoneys);
            lb.setPixelRecord(pixelRecord);
            leaderboardRepository.save(lb);
        }
    }

    private Leaderboard getOrCreateById(Long userId) {
        return leaderboardRepository.findById(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId).orElse(null);
                    if (user == null) return null;
                    Leaderboard lb = new Leaderboard();
                    lb.setUser(user);
                    lb.setUserId(user.getId());
                    if (user.getWallet() != null) {
                        lb.setCurrentMoneys(user.getWallet().getMoneys());
                        lb.setPixelRecord(user.getWallet().getPixelRecordSeconds());
                    }
                    return leaderboardRepository.save(lb);
                });
    }
}
