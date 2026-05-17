<!-- Utilisation en partie de l'IA nottament pour les svg -->
<template>
  <Transition name="fade">
    <div v-if="isLoading" class="loading-overlay" :class="{ 'server-error': !isOnline }">
      
      <div class="loading-visual-container">
        <div v-if="!isOnline" class="error-icon">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
        <img v-else src="../../assets/building/entrepot.png" alt="Entrepot" class="visual-entrepot" />
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

      <div class="loading-status" :class="{ 'status-error': !isOnline }">
        <div class="status-content">
          <span class="status-text">{{ isOnline ? 'Chargement' : 'Connexion au serveur impossible' }}</span>
          <span v-if="!isOnline" class="status-subtext">Tentative de reconnexion automatique...</span>
        </div>
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

const { isLoading, isOnline, currentTip, nextTip, prevTip } = useLoadingScreen();
</script>

<style src="../../styles/common/loadingScreen.css" scoped></style>
