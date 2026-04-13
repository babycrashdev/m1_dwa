<!--Temporaire-->
<template>
  <div class="clicker-container">
    <div class="clicker-card">
      <div class="score-display">
        <h2>Pixels Accumulés</h2>
        <div class="score-value">{{ score }}</div>
      </div>
      
      <button @click="click" class="big-pixel-btn">
        <div class="btn-icon"></div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useClicker } from '../scripts/clicker';
const { score, click } = useClicker();
</script>

<style src="../styles/clicker.css" scoped></style>
