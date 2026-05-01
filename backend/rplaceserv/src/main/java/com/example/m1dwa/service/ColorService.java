package com.example.m1dwa.service;

import com.example.m1dwa.model.*;
import com.example.m1dwa.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ColorService {

    private final WalletRepository walletRepository;
    private final UserRepository userRepository;
    private final RosePastelRepository roseRepository;
    private final BleuPastelRepository bleuRepository;
    private final VertPastelRepository vertRepository;

    private static final long COLOR_PRICE = 500;

    @Transactional
    public String buyColor(String username, String colorHex) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        Wallet wallet = walletRepository.findByUserUsername(username)
                .orElseThrow(() -> new RuntimeException("Portefeuille non trouvé"));

        if (wallet.getMoneys() < COLOR_PRICE) {
            return "Solde insuffisant !";
        }

        boolean alreadyOwned = false;

        switch (colorHex.toUpperCase()) {
            case "#FFB7CE":
                if (roseRepository.existsByUser(user))
                    alreadyOwned = true;
                else
                    roseRepository.save(new RosePastel(user));
                break;
            case "#AEC6CF":
                if (bleuRepository.existsByUser(user))
                    alreadyOwned = true;
                else
                    bleuRepository.save(new BleuPastel(user));
                break;
            case "#B2F2BB":
                if (vertRepository.existsByUser(user))
                    alreadyOwned = true;
                else
                    vertRepository.save(new VertPastel(user));
                break;
            default:
                return "Couleur non disponible à l'achat";
        }

        if (alreadyOwned) {
            return "Vous possédez déjà cette couleur !";
        }

        wallet.setMoneys(wallet.getMoneys() - COLOR_PRICE);
        walletRepository.save(wallet);

        return "Achat réussi !";
    }

    public java.util.List<String> getOwnedColors(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        java.util.List<String> owned = new java.util.ArrayList<>();
        if (roseRepository.existsByUser(user))
            owned.add("#FFB7CE");
        if (bleuRepository.existsByUser(user))
            owned.add("#AEC6CF");
        if (vertRepository.existsByUser(user))
            owned.add("#B2F2BB");
        return owned;
    }
}
