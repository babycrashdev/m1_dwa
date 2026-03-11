# 🎨 r/Place Clicker - Cahier d'Analyse et de Design (V2)test

## 🎮 Concept Global : La Symbiose des Mondes

Le projet repose sur un contraste dynamique entre deux expériences de jeu interdépendantes :

1.  **La Guerre des Pixels (La Grille)** : Un champ de bataille tactique et collaboratif de **50x50 pixels**.
2.  **Le Havre (La Ferme Clicker)** : Un espace de gestion paisible et personnel où le joueur développe sa puissance logistique.

---

## ⚔️ La Guerre des Pixels (Frontend Grille)

### 1. Stratégie Territoriale & Topologie

- **Expansion par Contiguïté** : Placement adjacent obligatoire (H/V).
- **Le Siège de Capitale** : Une capitale ne peut pas être capturée instantanément. Elle nécessite un état de "Siège" (encerclement ou contact prolongé pendant 1h) avant d'être neutralisée.
- **Règles d'Ambassade** : Placement interdit à moins de 5 pixels d'une capitale adverse ou dans des zones actives. Priorité aux zones en sommeil ou neutres.
- **Identité Tactique** : Utilisation de **Filtres de Vue** commutables :
  - _Mode Art_ : Affichage propre sans pollution visuelle.
  - _Mode Territoire_ : Affichage des bordures de clan et propriétaires.
  - _Mode Ressources_ : Visualisation des biomes et gisements.

### 2. Économie de Guerre

- **Coût & Maturité** : Escalade des prix par recouvrement. Bonus de maturité si le pixel survit.
- **Drones Sentinelles** : Ne peuvent être assignés qu'à des pixels contrôlés depuis plus de **30 minutes** (évite la protection de conquêtes éclairs).

---

## 🚜 Le Havre (Système Clicker & Logistique)

### 1. Gestion des Ressources

- **Biomes & Production** : Localisation géographique des matières premières.
- **L'Espace Vital (Overgrowth)** : Si le territoire baisse, la végétation envahit la ferme avec un **délai de grâce de 3h**. La perte n'est jamais immédiate, laissant une fenêtre de reconquête.

### 2. Régénération & Améliorations

- **Clicker & Usines** : Production de crédits hybride.
- **Marché Noir** : Items rares limités à **1 achat unique par joueur** par session. Enchères aveugles pour les objets de rareté "Légendaire" afin de contrer les scripts.

---

## 🌐 Dynamiques Mondiales

### 1. Événements & Gouvernance

- **Migration Dynamique** : Les gisements de ressources se déplacent si une entité contrôle plus de **70%** d'une zone pendant une période prolongée.
- **Conseil des Factions** : "1 Joueur = 1 Vote". Système démocratique pur favorisant les coalitions contre les clans dominants.
- **Cataclysmes** : Black Void et Pluie de Comètes pour redistribuer les cartes.

---

## 💻 Spécifications Techniques

### 📂 Données (Backend)

- **Base de données** : Relationnelle (SQL) via **JPA/JDBC**.
- **Architecture** : Découplage strict entre la couche de données (Pixels, Profits, Inventaires), la couche métier (Règles de contiguïté, Événements) et la couche Web.

### 🌐 Web (Frontend)

- **Interface** : JSP (JavaServer Pages), HTML5, CSS3, Javascript.
- **Identité** : 8 couleurs de base, extensibles via raffinage dans la ferme. Hologrammes/Messages de troc au survol des pixels.

---

## 📝 Gestion & Livrables

1.  **Code Source** complet et commits explicites.
2.  **Rapport (README)** : Incluant diagrammes UML, schémas relationnels et manuel d'utilisation.
3.  **Répartition des tâches** : Spécifiée dans le rendu final.
