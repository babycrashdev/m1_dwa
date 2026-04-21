# Guide de Contribution

Merci de vouloir contribuer à r/Place Clicker ! Voici les instructions pour mettre en place votre environnement de développement.

## 🚀 Installation Rapide

### 1. Prérequis
- Docker & Docker Compose
- Node.js (v18+)
- Java 17 + Maven

### 2. Configuration Backend
1. Naviguez dans `backend/`.
2. Créez un fichier `.env` basé sur `.env.example`.
3. Lancez l'infrastructure : `docker-compose up -d`.
4. Compilez le serveur : `cd rplaceserv && mvn clean package`.

### 3. Configuration Frontend
1. Naviguez dans `frontend/rplace-client/`.
2. Installez les dépendances : `npm install`.
3. Lancez le serveur de dev : `npm run dev`.

## 🛠️ Règles de développement

### Style de Code
- **Backend** : Suivre les conventions Google Java Style. Utiliser Lombok pour réduire le code boilerplate (Getters/Setters).
- **Frontend** : Utiliser la Composition API de Vue 3 avec TypeScript. Préférer le Vanilla CSS (fichiers `.css` séparés par composant) aux bibliothèques de composants lourdes.

### Pipeline Git
1. Toujours travailler sur une branche par fonctionnalité.
2. Les messages de commit doivent être clairs (ex: `feat(rplace): add dynamic grid synchronization`).
3. Mettre à jour le `CHANGELOG.md` pour chaque changement notable.

## 🧪 Tests
Avant de soumettre une modification :
- Vérifier que le backend compile sans erreurs.
- Vérifier qu'aucune erreur TypeScript n'est présente dans le frontend (`npm run build` pour tester).

## 📝 Processus de documentation
Si vous ajoutez une fonctionnalité complexe, veuillez :
1. Mettre à jour le schéma Mermaid dans `ARCHITECTURE.md` si nécessaire.
2. Créer un guide d'intégration dans le dossier `/info` pour aider les autres développeurs.
