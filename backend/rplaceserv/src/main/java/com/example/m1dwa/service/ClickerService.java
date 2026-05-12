package com.example.m1dwa.service;

import com.example.m1dwa.config.UpgradeDefinition;
import com.example.m1dwa.dto.ClickerStateDTO;
import com.example.m1dwa.model.Upgrade;
import com.example.m1dwa.model.User;
import com.example.m1dwa.model.Wallet;
import com.example.m1dwa.model.Slot;
import com.example.m1dwa.repository.SlotRepository;
import com.example.m1dwa.repository.UpgradeRepository;
import com.example.m1dwa.repository.UserRepository;
import com.example.m1dwa.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClickerService {

    private final UpgradeRepository upgradeRepository;
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final SlotRepository slotRepository;
    private final GameConfigService gameConfigService;
    private final ScoreboardService scoreboardService;

    public ClickerStateDTO getClickerState(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        java.util.List<Upgrade> upgrades = upgradeRepository.findByUser(user);
        Map<String, Object> levelsMap = new HashMap<>();
        
        for (Upgrade u : upgrades) {
            Map<String, Object> details = new HashMap<>();
            details.put("level", u.getLevel());
            details.put("efficiency", u.getEfficiencyLevel());
            details.put("production", u.getProductionLevel());
            
            levelsMap.put(u.getType(), details);
        }
        
        return new ClickerStateDTO(
            user.getWallet().getMoneys(),
            levelsMap
        );
    }

    @Transactional
    public ClickerStateDTO upgrade(String username, String upgradeType, String subType) {
        Wallet wallet = walletRepository.findByUserUsernameWithLock(username)
                .orElseThrow(() -> new RuntimeException("Portefeuille non trouvé"));
        
        User user = wallet.getUser();

        
        UpgradeDefinition config = gameConfigService.getUpgrades().get(upgradeType.toUpperCase());
        if (config == null) throw new RuntimeException("Type d'upgrade inconnu: " + upgradeType);

        Upgrade upgrade = getOrCreateUpgrade(user, upgradeType.toUpperCase());

        long price = 0;
        int currentLevel = 0;

        if ("main".equals(subType)) {
            currentLevel = upgrade.getLevel();
            // Equation de prix level-up: Prix = Prix_Base * (Multiplicateur_Prix ^ Level)
            price = (long) (config.getBasePrice() * Math.pow(config.getPriceMultiplier(), currentLevel));
        } else {
            UpgradeDefinition.SubUpgradeDefinition subConfig = config.getUpgrades().get(subType);
            if (subConfig == null) throw new RuntimeException("Sous-type d'upgrade inconnu: " + subType);
            
            if ("efficiency".equals(subType) || "time".equals(subType) || subConfig.getReductionPerLevelMs() != null) {
                currentLevel = upgrade.getEfficiencyLevel();
            } else if ("production".equals(subType) || subConfig.getIncreasePerLevel() != null) {
                currentLevel = upgrade.getProductionLevel();
            }
            price = (long) (subConfig.getBasePrice() * Math.pow(subConfig.getPriceMultiplier(), currentLevel));
        }

        int updated = walletRepository.decrementMoneys(user.getId(), price);

        if (updated == 0) {
            throw new RuntimeException("Solde insuffisant (concurrence détectée)");
        }


        if ("main".equals(subType)) {
            upgrade.setLevel(currentLevel + 1);
        } else {
            UpgradeDefinition.SubUpgradeDefinition subConfig = config.getUpgrades().get(subType);
            if ("efficiency".equals(subType) || "time".equals(subType) || (subConfig != null && subConfig.getReductionPerLevelMs() != null)) {
                upgrade.setEfficiencyLevel(currentLevel + 1);
            } else if ("production".equals(subType) || (subConfig != null && subConfig.getIncreasePerLevel() != null)) {
                upgrade.setProductionLevel(currentLevel + 1);
            }
        }
        upgradeRepository.save(upgrade);
        scoreboardService.pushScoreboard();


        log.info("Utilisateur {} a acheté l'upgrade {}/{} pour {}", username, upgradeType, subType, price);
        
        return getClickerState(username);
    }

    /* Fait avec l'IA */
    @Transactional
    public void syncMoneys(String username, long amount) {
       Wallet wallet = walletRepository.findByUserUsernameWithLock(username)
            .orElse(null);

        if (wallet == null) {
            log.warn("Sync ignoré pour {} : wallet non encore créé", username);
            return;
        }
        
        User user = wallet.getUser();

        
        LocalDateTime now = LocalDateTime.now();
        if (user.getLastClickerSyncAt() == null) {
            user.setLastClickerSyncAt(now.minusSeconds(gameConfigService.getClickerConfig().getSyncIntervalMs() / 1000 + 1));
        }
        
        long secondsElapsed = java.time.Duration.between(user.getLastClickerSyncAt(), now).toSeconds();
        if (secondsElapsed <= 0) secondsElapsed = 1;

        // long maxPossible = calculateMaxPossibleGain(user, secondsElapsed);
        long maxPossible = 1_000_000_000_000L;
        
        if (amount > maxPossible * 1.2) {
            log.warn("Tentative de triche détectée pour {} : {} moneys demandés, max possible {}", username, amount, maxPossible);
            throw new RuntimeException("Montant de synchronisation invalide (trop élevé)");
        }
        
        walletRepository.incrementMoneys(user.getId(), amount);
        scoreboardService.pushScoreboard();
        userRepository.updateLastClickerSyncAt(username, now);
        
        log.debug("Synchronisation validée de {} moneys pour {} (Max théorique : {})", amount, username, maxPossible);
    }

    /* Fait avec l'IA */
    private long calculateMaxPossibleGain(User user, long seconds) {
        Map<String, UpgradeDefinition> configMap = gameConfigService.getUpgrades();
        java.util.List<Upgrade> upgrades = upgradeRepository.findByUser(user);
        java.util.List<Slot> slots = slotRepository.findByUserOrderBySlotIndexAsc(user);
        
        double passiveIncomePerSec = 0;
        long maxCarValue = gameConfigService.getClickerConfig().getBaseCarValue();
        
        for (Upgrade u : upgrades) {
            UpgradeDefinition def = configMap.get(u.getType());
            if (def == null || !"WORKER".equals(def.getCategory())) continue;

            double prod = def.getBaseProduction() + (u.getProductionLevel() * (def.getUpgrades().containsKey("production") ? def.getUpgrades().get("production").getIncreasePerLevel() : 0));
            double intervalSec = (def.getBaseIntervalMs() - (u.getEfficiencyLevel() * (def.getUpgrades().containsKey("efficiency") ? def.getUpgrades().get("efficiency").getReductionPerLevelMs() : 0))) / 1000.0;
            if (intervalSec < 0.1) intervalSec = 0.1;
            passiveIncomePerSec += (u.getLevel() * prod) / intervalSec;
        }

        for (Slot slot : slots) {
            if (!slot.isUnlocked() || slot.getBuildingType() == null) continue;

            String type = slot.getBuildingType();
            UpgradeDefinition def = configMap.get(type);
            if (def == null || !"BUILDING".equals(def.getCategory())) continue;

            final String finalType = type;
            Upgrade upgrade = upgrades.stream()
                    .filter(u -> u.getType().equals(finalType))
                    .findFirst()
                    .orElse(null);

            if (upgrade != null && upgrade.getLevel() > 0) {
                maxCarValue += (long) upgrade.getLevel() * def.getBonusValueBonus();
            }
        }

        long maxActiveIncomePerSec = 15 * maxCarValue;
        
        return (long) ((passiveIncomePerSec + maxActiveIncomePerSec) * seconds);
    }

    private Upgrade getOrCreateUpgrade(User user, String type) {
        return upgradeRepository.findFirstByUserAndType(user, type)
                .orElseGet(() -> {
                    Upgrade newUpgrade = new Upgrade();
                    newUpgrade.setUser(user);
                    newUpgrade.setType(type);
                    newUpgrade.setLevel(0);
                    newUpgrade.setEfficiencyLevel(0);
                    newUpgrade.setProductionLevel(0);
                    return upgradeRepository.save(newUpgrade);
                });
    }
}
