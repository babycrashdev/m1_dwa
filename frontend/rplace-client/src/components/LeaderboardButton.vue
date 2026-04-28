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
const openLeaderboard = () => {
  console.log("Ouverture du classement (à implémenter)");
};
</script>
