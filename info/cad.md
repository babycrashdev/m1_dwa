# 🎨 r/Place Clicker - Cahier d'Analyse et de Design

## 🎮 Concept Global

Le projet consiste en une grille interactive de **50x50 pixels** accessible en temps réel par tous les utilisateurs. C'est un mélange entre le célèbre **r/Place** (dessin collaboratif) et un **Cookie Clicker** (progression incrémentale).

---

## 📜 Règles du Jeu

### 1. Principe Général

- **Grille Collaborative** : 2500 pixels (50x50) modifiables en temps réel par les utilisateurs connectés.
- **Accessibilité** :
  - **Visiteur** : Spectateur uniquement (voit les changements sans pouvoir agir).
  - **Joueur Authentifié** : Peut poser des pixels et accumuler des crédits.
- **Pas de Tour par Tour** : Toutes les modifications se font en simultané (concurrence).

### 2. Économie (Crédits & Pixels)

- **Coût des Pixels** :
  - Pixel vierge : **10 crédits**.
  - Recouvrement : **+5 crédits** à chaque modification (ex: 3 fois coloré = 25 crédits).
- **Régénération des Crédits** :
  - Passive : 1 crédit toutes les 10 secondes.
  - Active : En cliquant sur un bouton dédié (style Clicker).
  - Optimisée : Via l'achat de bonus.

---

## 🛠️ Fonctionnalités & Interface

### 👤 Gestion des Comptes

- Informations requises : Pseudo (unique), Mot de passe, Âge, Pays.
- Modification possible du profil (sauf le pseudo).

### 🕹️ Interface de Jeu

- **Vue Commune** : Grille en temps réel + Classement des joueurs.
- **Infos Pixel** : Affichage de l'auteur au survol (tooltip/hover).
- **Zone Joueur** (Authentifié uniquement) :
  - Solde de crédits.
  - Prix actuel de chaque pixel.
  - Liste des bonus débloqués/disponibles.
  - Sélecteur de couleur pour l'achat de pixels.

### 🍪 Système Clicker (Bonus)

- **Générateurs** : Automatisation de la récolte (curseurs, fermes, etc.).
- **Améliorations** :
  - Couleurs supplémentaires.
  - Outils de pose large (ex: curseur 2x2 pour 4 pixels d'un coup).

### 📊 Statistiques & Classements

- **Liste des joueurs** enregistrés.
- **Profil statistique** : Pixels placés, pixels encore en place, record de longévité.
- **Classements** :
  - Par pourcentage de couverture de la grille.
  - Par pixel le plus ancien encore actif.

---

## 💻 Contraintes Techniques

### 📂 Données (Backend)

- **Base de données** : Relationnelle (SQL).
- **Accès** : Framework **JPA** et/ou **JDBC**.
- **Architecture** : Découplage total entre la couche de données, la couche métier et la couche Web.

### 🌐 Web (Frontend)

- **Technologies** : HTML5, CSS3, Javascript.
- **Serveur** : JSP (JavaServer Pages).

---

## 📝 Évaluation & Livrables

### 🚀 Gestion de Projet (Git)

- Commits réguliers et explicites.
- Travail en équipe : Préciser les membres présents lors des commits en trinôme.
- Utilisation systématique du `pull` en début de session.

### 📦 Contenu du Rendu

1. **Code Source** complet.
2. **Rapport (README)** comprenant :
   - Choix de conception et d'implémentation.
   - Manuel d'utilisation (Tuto).
   - Répartition des tâches.
   - **Partie Données** : Schéma Entité-Association, Schéma Relationnel, Mapping Objet (JPA/JDBC).
   - **Architecture** : Diagrammes UML et schéma d'architecture globale.
