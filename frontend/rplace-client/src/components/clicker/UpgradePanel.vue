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
                  width="calc(100% - 4px)" height="calc(100% - 4px)"
                  fill="none" 
                  stroke="url(#worker-grad)" 
                  stroke-width="3"
                  pathLength="100"
                  :class="{ 'no-transition': (upgradeStore.cycleProgress[upgrade.id!] || 0) < 2 }"
                  :style="{ 
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

        <div class="upgrade-section" v-else>
          <h4 class="section-title">{{ formatName(upgrade.id!) }}</h4>
          
          <div class="upgrade-card primary" @click="buy(upgrade.id!, 'main')" :class="{ disabled: !canAfford(upgrade.id!, 'main') }">
            <div class="upgrade-icon">{{ getIcon(upgrade.category, upgrade.id!) }}</div>
            <div class="upgrade-info">
              <span class="name">Acheter</span>
              <span class="desc">{{ getUpgradeDesc(upgrade.id!, 'main') }}</span>
              <span class="cost">✨ {{ formatNumber(getPrice(upgrade.id!, 'main')) }}</span>
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

          <div class="upgrade-section-subs" v-if="Object.keys(upgrade.upgrades).length > 0">
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
                  <span class="cost">{{ isMaxLevel(upgrade.id!, subId.toString()) ? 'MAX' : '✨ ' + formatNumber(getPrice(upgrade.id!, subId.toString())) }}</span>
                </div>
                <div class="level-badge">Lvl {{ upgradeStore.getLevel(upgrade.id!, subId.toString()) }}</div>
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
    if (totalMinutes < 60) return `${totalMinutes.toFixed(1)}m`;
    
    const totalHours = totalMinutes / 60;
    return `${totalHours.toFixed(1)}h`;
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
    activateBoost
} = useUpgradePanel();
</script>

<style src="../../styles/clicker/upgradePanel.css" scoped></style>
