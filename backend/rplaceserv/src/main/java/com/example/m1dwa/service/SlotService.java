package com.example.m1dwa.service;

import com.example.m1dwa.config.ClickerConfig;
import com.example.m1dwa.model.Slot;
import com.example.m1dwa.model.Upgrade;
import com.example.m1dwa.model.User;
import com.example.m1dwa.model.Wallet;
import com.example.m1dwa.repository.SlotRepository;
import com.example.m1dwa.repository.UpgradeRepository;
import com.example.m1dwa.repository.UserRepository;
import com.example.m1dwa.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SlotService {

    private final SlotRepository slotRepository;
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final UpgradeRepository upgradeRepository;
    private final GameConfigService gameConfigService;
    private final ScoreboardService scoreboardService;

    @Transactional
    public List<Slot> getSlots(String username) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        List<Slot> slots = slotRepository.findByUserOrderBySlotIndexAsc(user);
        
        if (slots.isEmpty()) {
            initializeSlotsForUser(user);
            slots = slotRepository.findByUserOrderBySlotIndexAsc(user);
        }
        
        return slots;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void initializeSlotsForUser(User user) {
        List<Slot> existing = slotRepository.findByUserOrderBySlotIndexAsc(user);
        if (!existing.isEmpty()) return;

        int maxSlots = gameConfigService.getClickerConfig().getMaxSlots();
        for (int i = 0; i < maxSlots; i++) {
            Slot slot = new Slot();
            slot.setUser(user);
            slot.setSlotIndex(i);
            slot.setUnlocked(gameConfigService.getClickerConfig().isFirstSlotFree() && i == 0);
            try {
                slotRepository.saveAndFlush(slot);
            } catch (Exception e) {
                log.debug("Le slot {} existe déjà pour {}", i, user.getUsername());
            }
        }
    }

    @Transactional
    public List<Slot> unlockSlot(String username, int slotIndex) {
        Wallet wallet = walletRepository.findByUserUsernameWithLock(username)
                .orElseThrow(() -> new RuntimeException("Portefeuille non trouvé"));
        
        User user = wallet.getUser();


        List<Slot> slots = getSlots(username);
        Slot target = slots.stream()
                .filter(s -> s.getSlotIndex() == slotIndex)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Slot non trouvé"));

        if (target.isUnlocked()) {
            throw new RuntimeException("Ce slot est déjà débloqué");
        }

        long unlockedCount = slots.stream().filter(Slot::isUnlocked).count();
        ClickerConfig config = gameConfigService.getClickerConfig();
        
        long price = (long) (config.getSlotBasePrice() * Math.pow(config.getSlotPriceMultiplier(), unlockedCount));

        int updated = walletRepository.decrementMoneys(user.getId(), price);

        if (updated == 0) {
            throw new RuntimeException("Pas assez d'argent (Prix: " + price + ")");
        }


        target.setUnlocked(true);
        target.setLastAutoBonusAt(LocalDateTime.now());
        slotRepository.save(target);
        scoreboardService.pushScoreboard();

        log.info("{} a débloqué le slot {} pour {}", username, slotIndex, price);
        return slots;
    }

    @Transactional
    public List<Slot> placeBuilding(String username, int slotIndex, String buildingType) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        Slot slot = slotRepository.findByUserAndSlotIndex(user, slotIndex).orElseThrow(() -> new RuntimeException("Slot non trouvé"));

        if (!slot.isUnlocked()) {
            throw new RuntimeException("Le slot est verrouillé");
        }

        Upgrade upgrade = upgradeRepository.findFirstByUserAndType(user, buildingType.toUpperCase())
                .orElseThrow(() -> new RuntimeException("Bâtiment non débloqué : " + buildingType));
        
        if (upgrade.getLevel() <= 0) {
            throw new RuntimeException("Bâtiment non débloqué : niveau requis");
        }

        slot.setBuildingType(buildingType.toUpperCase());
        
        LocalDateTime now = LocalDateTime.now();
        slot.setLastAutoBonusAt(now);
        
        var config = gameConfigService.getUpgrades().get(buildingType.toUpperCase());
        if (config != null && config.getBoosts() != null) {
            long durationMs = config.getBoosts().getDurationMs();
            slot.setLastBoostAt(now.minus(java.time.Duration.ofMillis(durationMs + 1000)));
        } else {
            slot.setLastBoostAt(now);
        }

        slotRepository.save(slot);
        scoreboardService.pushScoreboard();

        log.info("Utilisateur {} a posé un {} sur le slot {}", username, buildingType, slotIndex);
        return getSlots(username);
    }

    @Transactional
    public List<Slot> activateBoost(String username, int slotIndex) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        Slot slot = slotRepository.findByUserAndSlotIndex(user, slotIndex).orElseThrow(() -> new RuntimeException("Slot non trouvé"));

        if (!slot.isUnlocked() || slot.getBuildingType() == null) {
            throw new RuntimeException("Pas de bâtiment sur ce slot");
        }

        com.example.m1dwa.config.UpgradeDefinition config = gameConfigService.getUpgrades().get(slot.getBuildingType());
        if (config == null || config.getBoosts() == null) {
            throw new RuntimeException("Ce bâtiment ne supporte pas de boost");
        }

        Upgrade upgrade = upgradeRepository.findFirstByUserAndType(user, slot.getBuildingType())
                .orElseThrow(() -> new RuntimeException("Données d'amélioration introuvables"));

        LocalDateTime now = LocalDateTime.now();
        if (!isBoostReady(slot, config, upgrade, now)) {
            throw new RuntimeException("Le boost est encore en recharge.");
        }

        slot.setLastBoostAt(now);
        slotRepository.save(slot);

        log.info("Boost activé sur le slot {} (bâtiment: {}) pour {}", slotIndex, slot.getBuildingType(), username);
        return getSlots(username);
    }

    @Transactional
    public List<Slot> activateAllBoosts(String username) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        List<Slot> slots = getSlots(username);
        LocalDateTime now = LocalDateTime.now();
        int activatedCount = 0;

        for (Slot slot : slots) {
            if (!slot.isUnlocked() || slot.getBuildingType() == null) continue;

            com.example.m1dwa.config.UpgradeDefinition config = gameConfigService.getUpgrades().get(slot.getBuildingType());
            if (config == null || config.getBoosts() == null) continue;

            Upgrade upgrade = upgradeRepository.findFirstByUserAndType(user, slot.getBuildingType()).orElse(null);
            if (upgrade == null) continue;

            if (isBoostReady(slot, config, upgrade, now)) {
                slot.setLastBoostAt(now);
                slotRepository.save(slot);
                activatedCount++;
            }
        }

        log.info("Utilisateur {} a activé {} boosts simultanément", username, activatedCount);
        return getSlots(username);
    }

    @Transactional
    public List<Slot> destroyBuilding(String username, int slotIndex) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        Slot slot = slotRepository.findByUserAndSlotIndex(user, slotIndex).orElseThrow(() -> new RuntimeException("Slot non trouvé"));

        slot.setBuildingType(null);
        slot.setLastBoostAt(null);
        slot.setLastAutoBonusAt(null);
        slot.setParcelPresent(false);
        slotRepository.save(slot);
        scoreboardService.pushScoreboard();

        log.info("Utilisateur {} a détruit le bâtiment sur le slot {}", username, slotIndex);
        return getSlots(username);
    }

    @Transactional
    public List<Slot> setParcelState(String username, int slotIndex, boolean present) {
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        Slot slot = slotRepository.findByUserAndSlotIndex(user, slotIndex).orElseThrow(() -> new RuntimeException("Slot non trouvé"));

        slot.setParcelPresent(present);
        slotRepository.save(slot);

        log.info("Colis sur le slot {} mis à jour: {} pour {}", slotIndex, present, username);
        return getSlots(username);
    }

    private boolean isBoostReady(Slot slot, com.example.m1dwa.config.UpgradeDefinition config, Upgrade upgrade, LocalDateTime now) {
        if (slot.getLastBoostAt() == null) return true;

        long baseCooldownMs = config.getBoosts().getCooldownMs();
        long reductionMs = 0;

        for (java.util.Map.Entry<String, com.example.m1dwa.config.UpgradeDefinition.SubUpgradeDefinition> entry : config.getUpgrades().entrySet()) {
            if (entry.getValue().getReductionPerLevelMs() != null) {
                reductionMs += (long) upgrade.getEfficiencyLevel() * entry.getValue().getReductionPerLevelMs();
            }
        }

        long finalCooldownMs = Math.max(1000, baseCooldownMs - reductionMs);
        long currentDurationMs = config.getBoosts().getDurationMs() + (long)(upgrade.getLevel() - 1) * config.getBoosts().getIncreaseDurationMs();
        long totalWaitMs = currentDurationMs + finalCooldownMs;

        LocalDateTime nextAvailable = slot.getLastBoostAt().plusNanos(totalWaitMs * 1_000_000L);
        return !now.isBefore(nextAvailable);
    }
}
