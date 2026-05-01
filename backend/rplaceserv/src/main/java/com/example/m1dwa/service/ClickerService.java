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
        Map<String, Integer> levelsMap = new java.util.HashMap<>();
        
        for (Upgrade u : upgrades) {
            levelsMap.put(u.getType() + "_level", u.getLevel());
            levelsMap.put(u.getType() + "_efficiency", u.getEfficiencyLevel());
            levelsMap.put(u.getType() + "_production", u.getProductionLevel());
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
            
            if ("efficiency".equals(subType)) {
                currentLevel = upgrade.getEfficiencyLevel();
            } else if ("production".equals(subType)) {
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
        } else if ("efficiency".equals(subType)) {
            upgrade.setEfficiencyLevel(currentLevel + 1);
        } else if ("production".equals(subType)) {
            upgrade.setProductionLevel(currentLevel + 1);
        }
        upgradeRepository.save(upgrade);

        log.info("Utilisateur {} a acheté l'upgrade {}/{} pour {}", username, upgradeType, subType, price);
        
        return getClickerState(username);
    }

    @Transactional
    public void syncMoneys(String username, long amount) {
        // TODO: Ajouter une validation basée sur les niveaux pour la triche
        walletRepository.incrementMoneys(username, amount);
        log.debug("Synchronisation de {} moneys pour {}", amount, username);
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
