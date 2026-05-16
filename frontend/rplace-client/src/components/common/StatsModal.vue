<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="stats-modal">
      <div class="stats-modal__header">
        <div class="header-user">
          <div class="user-avatar">{{ username.charAt(0).toUpperCase() }}</div>
          <div class="user-info">
            <h2 class="username">{{ username }}</h2>
            <span class="subtitle">Statistiques Globales</span>
          </div>
        </div>
        <button class="close-btn" @click="$emit('close')">&times;</button>
      </div>

      <div class="stats-modal__tabs">
        <button 
          class="tab-btn" 
          :class="{ 'tab-btn--active': activeTab === 'rplace' }"
          @click="activeTab = 'rplace'"
        >
          🎨 r/place
        </button>
        <button 
          class="tab-btn" 
          :class="{ 'tab-btn--active': activeTab === 'clicker' }"
          @click="activeTab = 'clicker'"
        >
          📦 Clicker
        </button>
      </div>

      <div class="stats-modal__body">
        <div v-if="loading" class="stats-loading">
          Chargement des données...
        </div>
        
        <div v-else-if="stats" class="stats-grid">
          <template v-if="activeTab === 'rplace'">
            <div class="stat-card">
              <div class="stat-icon">🎨</div>
              <div class="stat-content">
                <span class="stat-label">Total pixels posés</span>
                <span class="stat-value">{{ formatNumber(stats.totalPixelsPlaced) }}</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">📍</div>
              <div class="stat-content">
                <span class="stat-label">Pixels actifs</span>
                <span class="stat-value">{{ formatNumber(stats.activePixelsCount) }}</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">⚔️</div>
              <div class="stat-content">
                <span class="stat-label">Fois écrasé</span>
                <span class="stat-value">{{ formatNumber(stats.timesOverwritten) }}</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">⏱️</div>
              <div class="stat-content">
                <span class="stat-label">Survie actuelle</span>
                <span class="stat-value">{{ survivalTime }}</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🏆</div>
              <div class="stat-content">
                <span class="stat-label">Record de survie</span>
                <span class="stat-value">{{ formatTime(stats.pixelRecordSeconds) }}</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">💎</div>
              <div class="stat-content">
                <span class="stat-label">Pixel le plus cher</span>
                <span class="stat-value">{{ formatNumber(stats.mostExpensivePixelPrice) }} ✨</span>
              </div>
            </div>
          </template>

          <template v-if="activeTab === 'clicker'">
            <div class="stat-card">
              <div class="stat-icon">👆</div>
              <div class="stat-content">
                <span class="stat-label">Clics totaux</span>
                <span class="stat-value">{{ formatNumber(stats.totalClicks) }}</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">📦</div>
              <div class="stat-content">
                <span class="stat-label">Colis livrés</span>
                <span class="stat-value">{{ formatNumber(stats.totalParcelsGenerated) }}</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">💰</div>
              <div class="stat-content">
                <span class="stat-label">Fortune générée</span>
                <span class="stat-value">{{ formatNumber(stats.totalMoneyGenerated) }} ✨</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">💸</div>
              <div class="stat-content">
                <span class="stat-label">Argent dépensé</span>
                <span class="stat-value">{{ formatNumber(stats.totalMoneySpent) }} ✨</span>
              </div>
            </div>
          </template>
        </div>

        <div v-else class="stats-error">
          Impossible de charger les statistiques.
        </div>
      </div>

      <div class="stats-modal__footer">
        <div class="time-played">
          Temps de jeu total : <span>{{ formatTime(stats?.totalGameTimeSeconds || 0) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStatsModalLogic } from '../../scripts/common/statsModal';

const props = defineProps<{
  username: string;
}>();

defineEmits(['close']);

const {
  activeTab,
  stats,
  loading,
  survivalTime,
  formatNumber,
  formatTime
} = useStatsModalLogic(props.username);
</script>

<style src="../../styles/common/statsModal.css" scoped></style>
