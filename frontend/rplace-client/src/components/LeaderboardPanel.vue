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
import { useLeaderboardPanel } from '../scripts/leaderboardPanel';

defineEmits(['close']);

const { topPixels, topCredits } = useLeaderboardPanel();
</script>


<!-- Contenu généré par IA en dessous-->

<style src="../styles/auth.css" scoped></style>
<style src="../styles/leaderboardPanel.css" scoped></style>
