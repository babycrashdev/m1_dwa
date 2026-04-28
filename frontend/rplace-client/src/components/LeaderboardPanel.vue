<template>
  <div class="auth-container">
    <div class="auth-card leaderboard-card">
      <button class="close-btn" @click="$emit('close')">&times;</button>
      
      <div class="auth-form">
        <h2>Classement 🏆</h2>
        
        <div class="leaderboard-columns">
          <!-- Top Pixels -->
          <div class="leaderboard-column">
            <h3 class="column-title">Top pixels</h3>
            <div v-for="(player, idx) in topPixels" :key="'pixel-'+idx" class="leaderboard-row">
              <span class="rank-name">{{ player.username }}</span>
              <span class="rank-value">{{ player.score }}px</span>
            </div>
            <div v-for="i in Math.max(0, 5 - topPixels.length)" :key="'empty-pix-'+i" class="leaderboard-row empty-row">
              <span class="rank-name">---</span>
              <span class="rank-value">0px</span>
            </div>
          </div>

          <!-- Top Credits -->
          <div class="leaderboard-column">
            <h3 class="column-title">Top credits</h3>
            <div v-for="(player, idx) in topCredits" :key="'credit-'+idx" class="leaderboard-row">
              <span class="rank-name">{{ player.username }}</span>
              <span class="rank-value">{{ player.balance }}✨</span>
            </div>
            <div v-for="i in Math.max(0, 5 - topCredits.length)" :key="'empty-cre-'+i" class="leaderboard-row empty-row">
              <span class="rank-name">---</span>
              <span class="rank-value">0✨</span>
            </div>
          </div>

          <!-- Pixel le plus vieux -->
          <div class="leaderboard-column">
            <h3 class="column-title">Pixel le plus vieux</h3>
            <div v-for="i in 5" :key="'age-'+i" class="leaderboard-row">
              <span class="rank-name">--- {{}}</span>
              <span class="rank-value">--- {{}}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';

defineEmits(['close']);

const topPixels = ref<{username: string, score: number}[]>([]);
const topCredits = ref<{username: string, balance: number}[]>([]);

onMounted(async () => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    
    // On lance les deux appels en même temps pour gagner du temps
    const [pixelsRes, creditsRes] = await Promise.all([
      axios.get(`${apiUrl}/api/leaderboard/top-pixels`),
      axios.get(`${apiUrl}/api/leaderboard/top-credits`)
    ]);

    topPixels.value = pixelsRes.data;
    topCredits.value = creditsRes.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des classements:", error);
  }
});
</script>


<!-- Contenu généré par IA en dessous-->

<style src="../styles/auth.css" scoped></style>
<style scoped>
.leaderboard-card {
  max-width: 950px;
  width: 95%;
}

.leaderboard-columns {
  display: flex;
  gap: 25px;
  margin-top: 10px;
}

.leaderboard-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: rgba(255, 255, 255, 0.03);
  padding: 15px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.1);
}

.column-title {
  text-align: center;
  font-size: 1rem;
  color: #fbbf24;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-weight: 700;
}

.leaderboard-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  font-size: 0.9rem;
  position: relative;
}

.empty-row {
  opacity: 0.5;
  border-style: dashed;
}

.leaderboard-row:hover:not(.empty-row) {
  background: rgba(255, 255, 255, 0.12);
  transform: scale(1.05) translateY(-2px);
  border-color: #fbbf24;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.4);
  z-index: 10;
  cursor: pointer;
}

.rank-name {
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.rank-value {
  font-weight: 700;
  color: #fbbf24;
}

@media (max-width: 900px) {
  .leaderboard-columns {
    flex-direction: column;
  }
  .leaderboard-card {
    max-height: 85vh;
    overflow-y: auto;
    padding: 30px 20px;
  }
}
</style>
