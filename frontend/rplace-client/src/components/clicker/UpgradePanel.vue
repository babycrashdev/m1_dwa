<template>
  <div class="upgrade-panel">
    <div class="resource-header">
      <h3 v-if="activeTab === 'WORKER'">LOGISTIQUE</h3>
      <h3 v-else-if="activeTab === 'BUILDING'">IMMOBILIER</h3>
      <h3 v-else>AMÉLIORATIONS</h3>

      <div class="resource-item" v-if="activeTab === 'WORKER'">
        <span class="label">PRODUCTION</span>
        <span class="value highlight">{{ productionSummary }}</span>
      </div>
      
      <div class="resource-item" v-else-if="activeTab === 'BUILDING'">
        <span class="label">BONUS VENTE</span>
        <span class="value highlight">+{{ upgradeStore.totalBuildingBonus }} ✨ / voiture</span>
      </div>
      
      <div class="production-cycle" v-if="activeTab === 'WORKER' && upgradeStore.getLevel('WORKER') > 0">
        <div class="progress-container">
          <div class="progress-bar" :style="{ width: upgradeStore.cycleProgress + '%' }"></div>
        </div>
        <span class="progress-label">Cycle ouvrier en cours...</span>
      </div>
    </div>

    <div class="tabs-container" v-if="categories.length > 1">
      <button 
        v-for="cat in categories" 
        :key="cat"
        class="tab-button"
        :class="{ active: activeTab === cat }"
        @click="activeTab = cat"
      >
        {{ cat }}
      </button>
    </div>

    <div class="upgrade-list" v-if="upgradeStore.config">
      <div v-for="upgrade in currentUpgrades" :key="upgrade.id" class="upgrade-entry">
        <div class="upgrade-section">
          <h4 class="section-title">{{ formatName(upgrade.id!) }}</h4>
          
          <!-- Carte principale -->
          <div class="upgrade-card primary" @click="buy(upgrade.id!, 'main')" :class="{ disabled: !canAfford(upgrade.id!, 'main') }">
            <div class="upgrade-icon">{{ getIcon(upgrade.category, upgrade.id!) }}</div>
            <div class="upgrade-info">
              <span class="name">{{ upgrade.category === 'WORKER' ? 'Embaucher' : 'Acheter' }}</span>
              <span class="desc">{{ getUpgradeDesc(upgrade.id!, 'main') }}</span>
              <span class="cost">✨ {{ getPrice(upgrade.id!, 'main') }}</span>
            </div>
            <div class="level-badge">Lvl {{ upgradeStore.getLevel(upgrade.id!) }}</div>
          </div>

          <div class="building-actions" v-if="upgrade.category === 'BUILDING' && upgradeStore.getLevel(upgrade.id!) > 0">
            <div class="auto-bonus-area">
              <div class="bonus-label">
                <span>Auto-bonus (+{{ upgrade.bonusValueBonus }} ✨)</span>
                <span class="status" v-if="upgradeStore.hasAutoBonusCharge[upgrade.id!]">PRÊT !</span>
              </div>
              <div class="progress-mini">
                <div class="progress-fill" :style="{ width: getAutoBonusProgress(upgrade.id!) + '%' }" :class="{ charged: upgradeStore.hasAutoBonusCharge[upgrade.id!] }"></div>
              </div>
            </div>

            <button 
              class="boost-button" 
              :class="{ 
                active: isBoostActive(upgrade.id!), 
                cooldown: getBoostCooldownRemaining(upgrade.id!) > 0 && !isBoostActive(upgrade.id!) 
              }"
              @click.stop="activateBoost(upgrade.id!)"
              :disabled="getBoostCooldownRemaining(upgrade.id!) > 0"
            >
              <span v-if="isBoostActive(upgrade.id!)">🔥 BOOST ACTIF !</span>
              <span v-else-if="getBoostCooldownRemaining(upgrade.id!) > 0">
                ⌛ {{ (getBoostCooldownRemaining(upgrade.id!) / 1000).toFixed(0) }}s
              </span>
              <span v-else>🚀 ACTIVER BOOST</span>
            </button>
          </div>
        </div>

        <div class="upgrade-section" v-if="Object.keys(upgrade.upgrades).length > 0">
          <div class="sub-upgrades-grid">
            <div 
              v-for="(subCfg, subId) in upgrade.upgrades" 
              :key="subId"
              class="upgrade-card sub" 
              @click="buy(upgrade.id!, subId.toString())" 
              :class="{ disabled: !canAfford(upgrade.id!, subId.toString()) }"
            >
              <div class="upgrade-info">
                <span class="name">{{ formatName(subId.toString()) }}</span>
                <span class="desc">{{ getUpgradeDesc(upgrade.id!, subId.toString()) }}</span>
                <span class="cost">{{ isMaxLevel(upgrade.id!, subId.toString()) ? 'MAX' : '✨ ' + getPrice(upgrade.id!, subId.toString()) }}</span>
              </div>
              <div class="level-badge">Lvl {{ upgradeStore.getLevel(upgrade.id!, subId.toString()) }}</div>
            </div>
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
    activeTab,
    categories,
    currentUpgrades,
    getPrice, 
    canAfford, 
    isMaxLevel,
    buy, 
    productionSummary,
    formatName,
    getIcon,
    getUpgradeDesc,
    getAutoBonusProgress,
    isBoostActive,
    getBoostCooldownRemaining,
    activateBoost
} = useUpgradePanel();
</script>

<style src="../../styles/clicker/upgradePanel.css" scoped></style>
