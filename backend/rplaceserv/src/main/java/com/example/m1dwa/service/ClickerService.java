package com.example.m1dwa.service;

import com.example.m1dwa.config.UpgradeDefinition;
import com.example.m1dwa.dto.ClickerStateDTO;
import com.example.m1dwa.model.Upgrade;
import com.example.m1dwa.model.User;
import com.example.m1dwa.model.Wallet;
import com.example.m1dwa.repository.UpgradeRepository;
import com.example.m1dwa.repository.UserRepository;
import com.example.m1dwa.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ClickerService {

    private final UpgradeRepository upgradeRepository;
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final GameConfigService gameConfigService;

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
            
            if (u.getLastBoostAt() != null) {
                details.put("lastBoostAt", u.getLastBoostAt().toInstant(ZoneOffset.UTC).toEpochMilli());
            }
            if (u.getLastAutoBonusAt() != null) {
                details.put("lastAutoBonusAt", u.getLastAutoBonusAt().toInstant(ZoneOffset.UTC).toEpochMilli());
            }
            
            levelsMap.put(u.getType(), details);
        }
        
        return new ClickerStateDTO(
            user.getWallet().getMoneys(),
            levelsMap
        );
    }

    @Transactional
    public ClickerStateDTO upgrade(String username, String upgradeType, String subType) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
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

        Wallet wallet = user.getWallet();
        if (wallet.getMoneys() < price) {
            throw new RuntimeException("Solde insuffisant: " + price + " requis");
        }

        wallet.setMoneys(wallet.getMoneys() - price);
        walletRepository.save(wallet);

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

        log.info("Utilisateur {} a acheté l'upgrade {}/{} pour {}", username, upgradeType, subType, price);
        
        return getClickerState(username);
    }

    /* Fait avec l'IA */
    @Transactional
    public void syncMoneys(String username, long amount) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        LocalDateTime now = LocalDateTime.now();
        if (user.getLastClickerSyncAt() == null) {
            user.setLastClickerSyncAt(now.minusSeconds(gameConfigService.getClickerConfig().getSyncIntervalMs() / 1000 + 1));
        }
        
        long secondsElapsed = java.time.Duration.between(user.getLastClickerSyncAt(), now).toSeconds();
        if (secondsElapsed <= 0) secondsElapsed = 1;

        long maxPossible = calculateMaxPossibleGain(user, secondsElapsed);
        
        if (amount > maxPossible * 1.2) {
            log.warn("Tentative de triche détectée pour {} : {} moneys demandés, max possible {}", username, amount, maxPossible);
            throw new RuntimeException("Montant de synchronisation invalide (trop élevé)");
        }
        
        walletRepository.incrementMoneys(username, amount);
        user.setLastClickerSyncAt(now);
        userRepository.save(user);
        
        log.debug("Synchronisation validée de {} moneys pour {} (Max théorique : {})", amount, username, maxPossible);
    }

    /* Fait avec l'IA */
    private long calculateMaxPossibleGain(User user, long seconds) {
        Map<String, UpgradeDefinition> configMap = gameConfigService.getUpgrades();
        java.util.List<Upgrade> upgrades = upgradeRepository.findByUser(user);
        
        double passiveIncomePerSec = 0;
        long maxCarValue = gameConfigService.getClickerConfig().getBaseCarValue();
        
        for (Upgrade u : upgrades) {
            UpgradeDefinition def = configMap.get(u.getType());
            if (def == null) continue;

            if ("WORKER".equals(def.getCategory())) {
                double prod = def.getBaseProduction() + (u.getProductionLevel() * (def.getUpgrades().containsKey("production") ? def.getUpgrades().get("production").getIncreasePerLevel() : 0));
                double intervalSec = (def.getBaseIntervalMs() - (u.getEfficiencyLevel() * (def.getUpgrades().containsKey("efficiency") ? def.getUpgrades().get("efficiency").getReductionPerLevelMs() : 0))) / 1000.0;
                if (intervalSec < 0.1) intervalSec = 0.1;
                passiveIncomePerSec += (u.getLevel() * prod) / intervalSec;
            } 
            else if ("BUILDING".equals(def.getCategory())) {
                maxCarValue += (long) u.getLevel() * def.getBonusValueBonus();
            }
        }

        long maxActiveIncomePerSec = 15 * maxCarValue;
        
        return (long) ((passiveIncomePerSec + maxActiveIncomePerSec) * seconds);
    }

    /* Fait avec l'IA */
    @Transactional
    public ClickerStateDTO activateBoost(String username, String upgradeType) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        UpgradeDefinition config = gameConfigService.getUpgrades().get(upgradeType.toUpperCase());
        if (config == null || config.getBoosts() == null) {
            throw new RuntimeException("Ce type d'upgrade ne supporte pas de boost: " + upgradeType);
        }

        Upgrade upgrade = getOrCreateUpgrade(user, upgradeType.toUpperCase());
        
        if (upgrade.getLastBoostAt() != null) {
            long baseCooldownMs = config.getBoosts().getCooldownMs();
            long reductionMs = 0;

            for (Map.Entry<String, UpgradeDefinition.SubUpgradeDefinition> entry : config.getUpgrades().entrySet()) {
                if (entry.getValue().getReductionPerLevelMs() != null) {
                    reductionMs += (long) upgrade.getEfficiencyLevel() * entry.getValue().getReductionPerLevelMs();
                }
            }
            
            long finalCooldownMs = Math.max(1000, baseCooldownMs - reductionMs);
            
            long currentDurationMs = config.getBoosts().getDurationMs() + (upgrade.getLevel() - 1) * config.getBoosts().getIncreaseDurationMs();
            
            long totalWaitMs = currentDurationMs + finalCooldownMs;
            
            LocalDateTime nextAvailable = upgrade.getLastBoostAt().plusNanos(totalWaitMs * 1_000_000L);
            
            if (LocalDateTime.now().isBefore(nextAvailable)) {
                throw new RuntimeException("Le boost est encore en recharge. Prochain disponible à : " + nextAvailable);
            }
        }

        upgrade.setLastBoostAt(LocalDateTime.now());
        upgradeRepository.save(upgrade);
        
        log.info("Utilisateur {} a activé le boost pour {}", username, upgradeType);
        return getClickerState(username);
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
