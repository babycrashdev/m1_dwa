<template>
  <div class="upgrade-panel">
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
        
        <!-- Generer par IA -->
        <template v-if="upgrade.category === 'WORKER'">
          <div class="worker-card" :class="{ locked: upgradeStore.getLevel(upgrade.id!) === 0 }">
            <div class="progress-border-container">
              <svg class="progress-svg" width="100%" height="100%">
                <rect 
                  x="2" y="2" 
                  rx="18" ry="18" 
                  fill="none" 
                  stroke="rgba(255, 255, 255, 0.05)" 
                  stroke-width="3"
                  :style="{ width: 'calc(100% - 4px)', height: 'calc(100% - 4px)' }"
                />
                <rect 
                  x="2" y="2" 
                  rx="18" ry="18" 
                  fill="none" 
                  stroke="url(#worker-grad)" 
                  stroke-width="3"
                  pathLength="100"
                  :class="{ 'no-transition': (upgradeStore.cycleProgress[upgrade.id!] || 0) < 2 }"
                  :style="{ 
                    width: 'calc(100% - 4px)',
                    height: 'calc(100% - 4px)',
                    strokeDasharray: '100', 
                    strokeDashoffset: 100 - Math.min(100, (upgradeStore.cycleProgress[upgrade.id!] || 0) * 1.05) 
                  }"
                />
                <defs>
                  <linearGradient id="worker-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" style="stop-color:#4facfe;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#00f2fe;stop-opacity:1" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            
            <div class="worker-card-inner">
              <div v-if="upgradeStore.getLevel(upgrade.id!) === 0" class="unlock-area" @click="buy(upgrade.id!, 'main')">
                <div class="unlock-btn" :class="{ disabled: !canAfford(upgrade.id!, 'main') }">
                  <span class="icon">{{ getIcon(upgrade.category, upgrade.id!) }}</span>
                  <div class="unlock-text">
                    <span class="label">DÉBLOQUER {{ formatName(upgrade.id!) }}</span>
                    <span class="price">✨ {{ formatNumber(getPrice(upgrade.id!, 'main')) }}</span>
                  </div>
                </div>
              </div>

              <div v-else class="dashboard-area">
                <div class="main-action" @click="buy(upgrade.id!, 'main')" :class="{ disabled: !canAfford(upgrade.id!, 'main') }">
                  <div class="worker-brand">
                    <div class="icon-circle">{{ getIcon(upgrade.category, upgrade.id!) }}</div>
                    <div class="worker-meta">
                      <span class="name">{{ formatName(upgrade.id!) }}</span>
                      <div class="level-tag">Quantité : {{ upgradeStore.getLevel(upgrade.id!) }}</div>
                    </div>
                  </div>
                  <div class="production-info">
                    <span class="prod-value">{{ formatNumber(upgradeStore.getWorkerProduction(upgrade.id!) * upgradeStore.getLevel(upgrade.id!)) }} voitures / {{ formatTime(upgradeStore.getWorkerInterval(upgrade.id!)) }}</span>
                    <div class="buy-row">
                      <span class="price">✨ {{ formatNumber(getPrice(upgrade.id!, 'main')) }}</span>
                    </div>
                  </div>
                </div>

                <div class="sub-actions">
                  <div class="sub-btn efficiency" 
                    @click="buy(upgrade.id!, 'efficiency')" 
                    :class="{ 
                      disabled: !canAfford(upgrade.id!, 'efficiency') || isMaxLevel(upgrade.id!, 'efficiency'),
                      max: isMaxLevel(upgrade.id!, 'efficiency')
                    }"
                  >
                    <div class="sub-label">VITESSE</div>
                    <div class="sub-price" v-if="!isMaxLevel(upgrade.id!, 'efficiency')">✨ {{ formatNumber(getPrice(upgrade.id!, 'efficiency')) }}</div>
                    <div class="sub-price" v-else>MAX</div>
                    <div class="level-tag mini">Lvl {{ upgradeStore.getLevel(upgrade.id!, 'efficiency') }}</div>
                  </div>

                  <div class="sub-btn production" 
                    @click="buy(upgrade.id!, 'production')" 
                    :class="{ 
                      disabled: !canAfford(upgrade.id!, 'production') || isMaxLevel(upgrade.id!, 'production'),
                      max: isMaxLevel(upgrade.id!, 'production')
                    }"
                  >
                    <div class="sub-label">PRODUCTION</div>
                    <div class="sub-price" v-if="!isMaxLevel(upgrade.id!, 'production')">✨ {{ formatNumber(getPrice(upgrade.id!, 'production')) }}</div>
                    <div class="sub-price" v-else>MAX</div>
                    <div class="level-tag mini">Lvl {{ upgradeStore.getLevel(upgrade.id!, 'production') }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <div class="building-section" v-else>
          <div v-if="upgrade.id === currentUpgrades[0]?.id" class="global-action-container">
            <button 
              class="global-boost-btn" 
              @click="activateAllBoosts"
              :class="{ disabled: readyBoostsCount === 0 }"
            >
              <div class="boost-content">
                <span class="boost-icon">⚡</span>
                <span class="boost-label">ACTIVER TOUS LES BOOSTS</span>
                <span v-if="readyBoostsCount > 0" class="boost-badge">{{ readyBoostsCount }}</span>
              </div>
            </button>
          </div>

          <div class="building-card" :class="{ locked: upgradeStore.getLevel(upgrade.id!) === 0 }">
             <div class="worker-card-inner">
                <div v-if="upgradeStore.getLevel(upgrade.id!) === 0" class="unlock-area" @click="buy(upgrade.id!, 'main')">
                  <div class="unlock-btn" :class="{ disabled: !canAfford(upgrade.id!, 'main') }">
                    <span class="icon">{{ getIcon(upgrade.category, upgrade.id!) }}</span>
                    <div class="unlock-text">
                      <span class="label">DÉBLOQUER {{ formatName(upgrade.id!) }}</span>
                      <span class="price">✨ {{ formatNumber(getPrice(upgrade.id!, 'main')) }}</span>
                    </div>
                  </div>
                </div>

                <div v-else class="building-dashboard">
                   <button class="b-btn main-level" @click="buy(upgrade.id!, 'main')" :class="{ disabled: !canAfford(upgrade.id!, 'main') }">
                      <div class="b-brand">
                        <div class="b-icon-circle">{{ getIcon(upgrade.category, upgrade.id!) }}</div>
                         <div class="b-meta">
                           <span class="b-name">{{ formatName(upgrade.id!) }}</span>
                           <span class="b-price">✨ {{ formatNumber(getPrice(upgrade.id!, 'main')) }}</span>
                           <div class="on-map-badge" :class="{ 'none': getPlacedCount(upgrade.id!) === 0 }">
                              📍 Sur Map : {{ getPlacedCount(upgrade.id!) }}
                           </div>
                         </div>
                       </div>
                       <div class="level-tag mini">Lvl {{ upgradeStore.getLevel(upgrade.id!) }}</div>
                   </button>

                   <button class="b-btn speed-up" @click="buy(upgrade.id!, 'time')" :class="{ disabled: !canAfford(upgrade.id!, 'time') || isMaxLevel(upgrade.id!, 'time') }">
                      <div class="b-label">VITESSE</div>
                      <div class="b-price" v-if="!isMaxLevel(upgrade.id!, 'time')">✨ {{ formatNumber(getPrice(upgrade.id!, 'time')) }}</div>
                      <div class="b-price" v-else>MAX</div>
                      <div class="level-tag mini">Lvl {{ upgradeStore.getLevel(upgrade.id!, 'time') }}</div>
                   </button>

                   <button 
                    class="b-btn boost-action" 
                    @click="activateBoost(upgrade.id!)" 
                    :class="{ 
                      active: isBoostActive(upgrade.id!), 
                      cooldown: getBoostCooldownRemaining(upgrade.id!) > 0,
                      disabled: isBoostActive(upgrade.id!) || getBoostCooldownRemaining(upgrade.id!) > 0 
                    }"
                   >
                       <div v-if="getBoostCooldownRemaining(upgrade.id!) > 0" class="cooldown-overlay">
                         <span class="timer">{{ formatTime(getBoostCooldownRemaining(upgrade.id!)) }}</span>
                       </div>
                       <div class="b-label">{{ isBoostActive(upgrade.id!) ? 'ACTIF' : 'BOOST' }}</div>
                       <div class="boost-icon-small">
                         ⚡
                         <span v-if="getReadyCountByType(upgrade.id!) > 0" class="ready-mini-badge">{{ getReadyCountByType(upgrade.id!) }}</span>
                       </div>
                    </button>
                </div>
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

  const formatNumber = (num: number): string => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return num.toString();
  };

  const formatTime = (ms: number): string => {
    const totalSeconds = ms / 1000;
    if (totalSeconds < 60) return `${totalSeconds.toFixed(0)}s`;
    
    const totalMinutes = totalSeconds / 60;
    if (totalMinutes < 60) return `${totalMinutes.toFixed(0)}m`;
    
    const totalHours = totalMinutes / 60;
    return `${totalHours.toFixed(0)}h`;
  };

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
    activateBoost,
    activateAllBoosts,
    readyBoostsCount,
    getPlacedCount,
    getReadyCountByType
} = useUpgradePanel();
</script>

<style src="../../styles/clicker/upgradePanel.css" scoped></style>
