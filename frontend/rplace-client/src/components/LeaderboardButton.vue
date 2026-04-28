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
import { useApp } from '../scripts/app';

const { toggleLeaderboard } = useApp();

const openLeaderboard = () => {
  toggleLeaderboard();
};
</script>
