# Changelog

## [0.2.0] - 2026-04-20

### Ajouté
- **WebSockets** : Support de l'accès anonyme (Read-Only) pour observer le plateau sans être connecté.
- **Grille Dynamique** : Synchronisation de la taille de la carte (`grid.size`) entre le backend et le frontend.
- **Sécurité** : Externalisation complète des clés secrètes et URLs d'API via les variables d'environnement (`.env` et Vite).

### Corrigé
- **UX** : Optimisations du rendu Canvas et corrections de l'alignement des pixels.
- **Security** : Correction du chargement des variables d'environnement dans le client.

## [0.1.5] - 2026-04-16

### Ajouté
- **r/Place** : Implémentation initiale des WebSockets (STOMP) pour le placement de pixels en temps réel.
- **r/Place** : Système de choix de couleurs et placement sur le canvas.
- **Clicker** : Liaison Backend/Frontend pour les premières mécaniques de clic.
- **Clicker** : Structure de base du mode "Ferme" (backend logic + basic frontend).
- **Tooling** : Ajout de Mermerd pour la génération automatique de diagrammes de base de données.

### Corrigé
- **Clicker** : Amélioration visuelle des cartes (Cards) et des boutons d'upgrade.

## [0.1.2] - 2026-04-13

### Ajouté
- **Profil** : Création du composant profil utilisateur pour consulter ses statistiques.
- **UI** : Ajout d'un bouton de switch pour alterner entre le mode "Guerre" (r/Place) et le mode "Havre" (Clicker).

### Corrigé
- **State Management** : Correction de la synchronisation entre le backend et le store Pinia pour les données de profil.

## [0.1.1] - 2026-04-01

### Ajouté
- **Authentification** : Système complet de Login et Register avec Spring Security et JWT.
- **UI** : Persistance de la session utilisateur et design responsive pour les formulaires.

### Corrigé
- **Sécurité** : Migration de la clé secrète JWT vers les variables d'environnement.
- **Bug** : Corrections diverses sur le processus d'inscription.

## [0.1.0] - 2026-03-11

### Ajouté
- **Foundation** : Initialisation du serveur Spring Boot et du client Vue.js 3.
- **Data** : Configuration initiale de la base de données MariaDB avec Docker Compose.
- **CI/CD** : Mise en place du workflow GitLab Auto-push et des Readme initiaux.

---
*Ce changelog a été généré automatiquement à partir de l'historique Git.*
