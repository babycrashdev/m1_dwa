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
        {{ formatName(cat) }}
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
                    <div class="bonus-val" v-if="!isMaxLevel(upgrade.id!, 'efficiency')">{{ getUpgradeBonus(upgrade.id!, 'efficiency') }}</div>
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
                    <div class="bonus-val" v-if="!isMaxLevel(upgrade.id!, 'production')">{{ getUpgradeBonus(upgrade.id!, 'production') }}</div>
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
                <span class="boost-label">BOOST TOUT</span>
                <span v-if="readyBoostsCount > 0" class="boost-badge">{{ readyBoostsCount }}</span>
              </div>
            </button>
          </div>

          <div class="building-card" :class="{ locked: upgradeStore.getLevel(upgrade.id!) === 0 }">
             <div v-if="upgradeStore.getLevel(upgrade.id!) === 0" class="unlock-area" @click="buy(upgrade.id!, 'main')">
                <div class="unlock-btn" :class="{ disabled: !canAfford(upgrade.id!, 'main') }">
                  <span class="icon">
                    <img v-if="upgrade.category === 'BUILDING'" :src="getSpriteUrl(upgrade.id!)" class="b2-sprite-img" />
                    <template v-else>{{ getIcon(upgrade.category, upgrade.id!) }}</template>
                  </span>
                  <div class="unlock-text">
                    <span class="label">DÉBLOQUER {{ formatName(upgrade.id!) }}</span>
                    <span class="price">✨ {{ formatNumber(getPrice(upgrade.id!, 'main')) }}</span>
                  </div>
                </div>
             </div>

             <template v-else>
                <div class="b2-content">
                   <div class="b2-info-area">
                      <div class="b2-level-circle">Lvl {{ upgradeStore.getLevel(upgrade.id!) }}</div>
                      
                      <div class="b2-header">
                         <div class="b2-icon">
                            <img :src="getSpriteUrl(upgrade.id!)" class="b2-sprite-img" />
                         </div>
                         <div class="b2-title">
                            <span class="name">{{ formatName(upgrade.id!) }}</span>
                            <div class="b2-map-pill" :class="{ 'none': getPlacedCount(upgrade.id!) === 0 }">
                               Sur Map : {{ getPlacedCount(upgrade.id!) }}
                            </div>
                         </div>
                      </div>

                      <div class="b2-footer">
                         <div class="b2-stats">
                            <span class="prod">{{ getProductionInfo(upgrade.id!) }}</span>
                            <span class="price">✨ {{ formatNumber(getPrice(upgrade.id!, 'main')) }}</span>
                         </div>
                         <button 
                            class="b2-up-btn" 
                            @click="buy(upgrade.id!, 'main')"
                            :class="{ disabled: !canAfford(upgrade.id!, 'main') }"
                         >
                            <svg class="up-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 17L12 10M12 10L15 13M12 10L9 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                              <path d="M16 7H12H8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                              <path  d="M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z" stroke="currentColor" stroke-width="1.5"/>
                            </svg>
                         </button>
                      </div>
                   </div>

                   <div class="b2-sub-area">
                      <button 
                        class="b2-sub-btn" 
                        @click="buy(upgrade.id!, 'time')"
                        :class="{ disabled: !canAfford(upgrade.id!, 'time') || isMaxLevel(upgrade.id!, 'time') }"
                      >
                         <div class="b2-level-circle mini">Lvl {{ upgradeStore.getLevel(upgrade.id!, 'time') }}</div>
                         <span class="b2-sub-label">Vitesse</span>
                         <span class="bonus-val" v-if="!isMaxLevel(upgrade.id!, 'time')">{{ getUpgradeBonus(upgrade.id!, 'time') }}</span>
                         <span class="b2-sub-price" v-if="!isMaxLevel(upgrade.id!, 'time')">✨ {{ formatNumber(getPrice(upgrade.id!, 'time')) }}</span>
                         <span class="b2-sub-price" v-else>MAX</span>
                      </button>

                      <button 
                        class="b2-individual-boost-btn" 
                        @click="activateBoost(upgrade.id!)"
                        :class="{ 
                          active: isBoostActive(upgrade.id!), 
                          cooldown: getBoostCooldownRemaining(upgrade.id!) > 0,
                          disabled: isBoostActive(upgrade.id!) || getBoostCooldownRemaining(upgrade.id!) > 0 
                        }"
                      >
                         <div class="b2-progress-fill" :style="{ width: getAutoBonusProgress(upgrade.id!) + '%', opacity: 0.3 }"></div>
                         
                         <div v-if="getBoostCooldownRemaining(upgrade.id!) > 0" class="cooldown-overlay-pill">
                           <span>{{ formatTime(getBoostCooldownRemaining(upgrade.id!)) }}</span>
                         </div>
                         
                         <span v-else class="b2-sub-label" style="color: white; z-index: 2;">{{ isBoostActive(upgrade.id!) ? 'ACTIF' : 'BOOST' }}</span>
                         
                         <div v-if="getReadyCountByType(upgrade.id!) > 0" class="red-dot-badge">
                            {{ getReadyCountByType(upgrade.id!) }}
                         </div>
                      </button>
                   </div>
                </div>
             </template>
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
import { formatNumber} from '../../scripts/common/formatNumber';
import { formatTime } from '../../scripts/common/formatTime';

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
    getSpriteUrl,
    getUpgradeBonus,
    getUpgradeDesc,
    getAutoBonusProgress,
    isBoostActive,
    getBoostCooldownRemaining,
    activateBoost,
    activateAllBoosts,
    readyBoostsCount,
    getPlacedCount,
    getReadyCountByType,
    getProductionInfo
} = useUpgradePanel();
</script>

<style src="../../styles/clicker/upgradePanel.css" scoped></style>
