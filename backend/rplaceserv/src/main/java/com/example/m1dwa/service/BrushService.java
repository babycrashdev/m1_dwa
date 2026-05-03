package com.example.m1dwa.service;

import com.example.m1dwa.model.*;
import com.example.m1dwa.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BrushService {

    private final WalletRepository walletRepository;
    private final UserRepository userRepository;
    private final BrushRepository brushRepository;

    private static final Map<String, Long> UPGRADE_PRICES = Map.of(
            "3x3", 500L,
            "5x5", 1000L,
            "7x7", 2500L,
            "9x9", 5000L
    );

    @Transactional
    public String buyUpgrade(String username, String upgrade) {
        if (!UPGRADE_PRICES.containsKey(upgrade)) {
            return "Amélioration non disponible";
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (brushRepository.existsByUserAndBrushUpgrade(user, upgrade)) {
            return "Vous possédez déjà cette amélioration !";
        }

        Wallet wallet = walletRepository.findByUserUsername(username)
                .orElseThrow(() -> new RuntimeException("Portefeuille non trouvé"));

        long price = UPGRADE_PRICES.get(upgrade);

        if (wallet.getMoneys() < price) {
            return "Solde insuffisant !";
        }

        wallet.setMoneys(wallet.getMoneys() - price);
        walletRepository.save(wallet);

        brushRepository.save(new Brush(user, upgrade));

        return "Achat réussi !";
    }

    public List<String> getOwnedUpgrades(String username) {
        return brushRepository.findByUserUsername(username).stream()
                .map(Brush::getBrushUpgrade)
                .collect(Collectors.toList());
    }
}
