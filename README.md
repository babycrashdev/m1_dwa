Projet de développement web 2026

Status de la communication avec Gitlab
[![GitLab auto Push](https://github.com/babycrashdev/m1_dwa/actions/workflows/GitlabAutoPush.yml/badge.svg?branch=main)](https://github.com/babycrashdev/m1_dwa/actions/workflows/GitlabAutoPush.yml)

CookieCliker/Rplace

Proposition d'architecture

```mermaid
graph LR

C((Client)) <--> S((Server))
S <--> B[(BDD)]

subgraph Client
C --> C1[Framework : VueJs]
C --> C2[Store : Pinia]
C --> C3[client HTTP : Axios]
C --> C4[persistance : LocalStorage]
end

subgraph docker - Server
S --> S1[SpringBoot]
S --> S4[Spring Data JPA]
S --> S2[gestion connexions]
end
subgraph docker - Base de données
B --> P[Compte joueur]
P --> P1[infos du compte]
P --> P2[clicker - status des upgrades ]
P --> P3[rplace - pixels possédés]
B --> M[Rplace Map Générale]
M --> M1[Position/couleur des pixels]
M --> M2[Prix des pixels]
end

```

---
## Lancement application

### 1. Backend & Infrastructure (Docker)
```bash
# Compiler le serveur
cd backend/rplaceserv
mvn clean package

# Lancer la DB et l'API
cd backend
docker-compose up -d
```

### 2. Frontend (Vue.js)
```bash
# Lancer le client
cd frontend/rplace-client
npm install
npm run dev
```
---
**Accès :**
- Frontend : http://localhost:5173
- API : http://localhost:8080
