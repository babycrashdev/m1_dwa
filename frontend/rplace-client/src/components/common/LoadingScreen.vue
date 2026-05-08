
<template>
  <Transition name="fade">
    <div v-if="isLoading" class="loading-overlay">
      

      <div class="loading-visual-container">
        <img src="../../assets/building/entrepot.png" alt="Entrepot" class="visual-entrepot" />
      </div>

      <div class="tips-wrapper">
        <button class="nav-arrow" @click="prevTip" aria-label="Précédent">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        <div class="tip-content">
          <p class="tip-text">{{ currentTip }}</p>
        </div>

        <button class="nav-arrow" @click="nextTip" aria-label="Suivant">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>

      <div class="loading-status">
        <span class="status-text">Chargement</span>
        <div class="dots">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
      </div>

    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useLoadingScreen } from '../../scripts/common/loadingScreen';

const { isLoading, currentTip, nextTip, prevTip } = useLoadingScreen();
</script>

<style src="../../styles/common/loadingScreen.css" scoped></style>
