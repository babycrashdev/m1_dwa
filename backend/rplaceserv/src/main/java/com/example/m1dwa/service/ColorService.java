package com.example.m1dwa.service;

import com.example.m1dwa.model.*;
import com.example.m1dwa.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ColorService {

    private final WalletRepository walletRepository;
    private final UserRepository userRepository;
    private final ColorRepository colorRepository;
    private final UserStatsService userStatsService;

    private static final long COLOR_PRICE = 500;

    private static final List<String> ALLOWED_PASTELS = List.of("#FFB7CE", "#AEC6CF", "#B2F2BB");

    @Transactional
    public String buyColor(String username, String colorHex) {
        String hex = colorHex.toUpperCase();

        if (!ALLOWED_PASTELS.contains(hex)) {
            return "Couleur non disponible à l'achat";
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (colorRepository.existsByUserAndColorCode(user, hex)) {
            return "Vous possédez déjà cette couleur !";
        }

        int updated = walletRepository.decrementMoneys(user.getId(), COLOR_PRICE);

        if (updated == 0) {
            return "Solde insuffisant !";
        }


        colorRepository.save(new Color(user, hex));
        userStatsService.addMoneySpent(user, COLOR_PRICE);

        return "Achat réussi !";
    }

    public List<String> getOwnedColors(String username) {
        return colorRepository.findByUserUsername(username).stream()
                .map(Color::getColorCode)
                .collect(Collectors.toList());
    }
}
