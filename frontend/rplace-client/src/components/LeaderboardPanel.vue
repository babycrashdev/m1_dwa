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
            <div v-for="i in 5" :key="'pixel-'+i" class="leaderboard-row">
              <span class="rank-name">Pseudo {{ i }}</span>
              <span class="rank-value">--- {{}}</span>
            </div>
          </div>

          <!-- Top Credits -->
          <div class="leaderboard-column">
            <h3 class="column-title">Top credits</h3>
            <div v-for="i in 5" :key="'credit-'+i" class="leaderboard-row">
              <span class="rank-name">Pseudo {{ i }}</span>
              <span class="rank-value">--- {{ }}</span>
            </div>
          </div>

          <!-- Pixel le plus vieux -->
          <div class="leaderboard-column">
            <h3 class="column-title">Pixel le plus vieux</h3>
            <div v-for="i in 5" :key="'age-'+i" class="leaderboard-row">
              <span class="rank-name">Pseudo {{ i }}</span>
              <span class="rank-value">--- {{}}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits(['close']);
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
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.leaderboard-row:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.3);
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
