<template>
  <div class="upgrade-panel">
    <div class="resource-header">
      <h3>LOGISTIQUE</h3>
      <div class="resource-item">
        <span class="label">PRODUCTION</span>
        <span class="value highlight">{{ productionSummary }}</span>
      </div>
      
      <!-- Barre de progression des ouvriers -->
      <div class="production-cycle" v-if="upgradeStore.levels.workerCount > 0">
        <div class="progress-container">
          <div class="progress-bar" :style="{ width: upgradeStore.cycleProgress + '%' }"></div>
        </div>
        <span class="progress-label">Cycle ouvrier en cours...</span>
      </div>
    </div>

    <div class="upgrade-list" v-if="upgradeStore.config">
      <div class="upgrade-section">
        <h4 class="section-title">Ouvriers Automatiques</h4>
        <div class="upgrade-card primary" @click="buy('WORKER', 'main')" :class="{ disabled: !canAfford('WORKER', 'main') }">
          <div class="upgrade-icon">👷</div>
          <div class="upgrade-info">
            <span class="name">Embaucher un Ouvrier</span>
            <span class="desc">Augmente la production de base</span>
            <span class="cost">✨ {{ getPrice('WORKER', 'main') }}</span>
          </div>
          <div class="level-badge">Lvl {{ upgradeStore.levels.workerCount }}</div>
        </div>
      </div>

      <div class="upgrade-section">
        <h4 class="section-title">Spécialisations</h4>
        <div class="sub-upgrades-grid">
          <div class="upgrade-card sub" @click="buy('WORKER', 'efficiency')" :class="{ disabled: !canAfford('WORKER', 'efficiency') }">
            <div class="upgrade-info">
              <span class="name">Efficacité</span>
              <span class="desc">Réduit le temps de cycle</span>
              <span class="cost">{{ isMaxLevel('WORKER', 'efficiency') ? 'NIVEAU MAX' : '✨ ' + getPrice('WORKER', 'efficiency') }}</span>
            </div>
            <div class="level-badge">Lvl {{ upgradeStore.levels.efficiencyLevel }}</div>
          </div>

          <div class="upgrade-card sub" @click="buy('WORKER', 'production')" :class="{ disabled: !canAfford('WORKER', 'production') }">
            <div class="upgrade-info">
              <span class="name">Productivité</span>
              <span class="desc">Plus de voitures par cycle</span>
              <span class="cost">✨ {{ getPrice('WORKER', 'production') }}</span>
            </div>
            <div class="level-badge">Lvl {{ upgradeStore.levels.productionLevel }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-else class="loading-state">
      Initialisation de l'usine...
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUpgradePanel } from '../../scripts/clicker/upgradePanel';

const { 
    upgradeStore, 
    getPrice, 
    canAfford, 
    isMaxLevel,
    buy, 
    productionSummary 
} = useUpgradePanel();
</script>

<style src="../../styles/clicker/upgradePanel.css" scoped></style>
