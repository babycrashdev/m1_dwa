<template>
  <button 
    class="view-toggle-btn"
    @click="openLeaderboard"
    title="Classement"
  >
    <span style="font-size: 24px; line-height: 1;">🏆</span>
  </button>
</template>

<script setup lang="ts">
import { useLeaderboardButton } from '../scripts/leaderboardButton';
const { openLeaderboard } = useLeaderboardButton();
</script>

<style src="../styles/leaderboardButton.css" scoped></style>
