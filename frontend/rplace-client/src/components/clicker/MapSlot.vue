<template>
  <div 
    class="map-slot" 
    :class="{ 
      locked: !slotData?.unlocked, 
      empty: slotData?.unlocked && !slotData?.buildingType,
      occupied: slotData?.buildingType,
      'picker-open': showPicker || showMenu
    }"
    @click="handleClick"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >


    <div v-if="!slotData?.unlocked" class="slot-content locked-content">
      <div class="lock-icon">🔒</div>
      <div class="price-tag">✨ {{ formatNumber(mapStore.getNextSlotPrice()) }}</div>
    </div>

    <div v-else-if="!slotData?.buildingType" class="slot-content empty-content">
      <div class="add-icon">+</div>
      <div class="label">BÂTIR</div>
    </div>

    <div v-else class="slot-content building-content">
      <div class="slot-border-container">
        <svg class="slot-progress-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="fireGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#ff9a9e" />
              <stop offset="50%" stop-color="#fecfef" />
              <stop offset="100%" stop-color="#ff0844" />
            </linearGradient>
            <linearGradient id="flameGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#f6d365" />
              <stop offset="100%" stop-color="#fda085" />
            </linearGradient>
          </defs>
          <rect 
            x="2" y="2" width="96" height="92" rx="5" ry="5" 
            class="progress-bg"
          />
          <rect 
            x="2" y="2" width="96" height="92" rx="5" ry="5" 
            class="progress-fg"
            :class="{ boosting: isBoosting, ready: !isBoosting && (progressPercent >= 99.9 || slotData?.parcelPresent) }"
            pathLength="100"
            :style="{ 
              strokeDasharray: '100', 
              strokeDashoffset: isBoosting ? (100 - progressPercent) : ((slotData?.parcelPresent || progressPercent >= 99.9) ? 0 : 100 - progressPercent),
              stroke: isBoosting ? 'url(#flameGradient)' : ((slotData?.parcelPresent || progressPercent >= 99.9) ? '#2ecc71' : '#4facfe')
            }"
          />
        </svg>
      </div>

      <div class="building-sprite">
        <img :src="getSpriteUrl(slotData.buildingType)" :alt="slotData.buildingType" />
      </div>


    </div>

    <div v-if="showPicker" class="building-picker-overlay" :class="{ 'bottom-position': slotIndex >= 7 }" @click.stop="showPicker = false">
      <div class="picker-card" @click.stop>
        <div class="picker-header">
          <h3>Choisir un bâtiment</h3>
        </div>
        
        <div v-if="availableBuildings.length > 0" class="picker-grid">
          <div 
            v-for="b in availableBuildings" 
            :key="b.id" 
            class="picker-item"
            @click="placeBuilding(b.id)"
          >
            <div class="p-icon-wrapper">
              <img :src="getSpriteUrl(b.id)" :alt="b.id" class="p-img" />
            </div>
            <div class="p-info">
              <span class="p-name">{{ formatBuildingName(b.id) }}</span>
              <span class="p-stat">{{ getBuildingStats(b.id) }}</span>
            </div>
          </div>
        </div>

        <div v-else class="picker-empty-state">
          <div class="empty-icon">🚧</div>
          <p class="empty-title">Aucun bâtiment disponible</p>
          <p class="empty-desc">Débloquez-les d'abord dans le panneau d'améliorations !</p>
        </div>
      </div>
    </div>

    <div v-if="showMenu" class="slot-menu-overlay" :class="{ 'bottom-position': slotIndex >= 7 }" @click.stop="showMenu = false">
      <div class="menu-card" @click.stop>
        <button 
          class="menu-btn boost" 
          :class="{ 
            disabled: isBoosting || cooldown > 0,
            'active-boost': isBoosting,
            'cooldown-boost': cooldown > 0
          }"
          @click="boost"
        >
          {{ isBoosting ? '🚀 Boost Actif' : (cooldown > 0 ? `⏳ ${formatTime(cooldown/1000)}` : '🚀 BOOST PRODUCTION') }}
        </button>
        <button class="menu-btn destroy" @click="destroy">🗑️ Détruire le bâtiment</button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { watch, onBeforeUnmount } from 'vue';

import { useMapSlot } from '../../scripts/clicker/mapSlot';

const props = defineProps<{
  slotIndex: number
}>();

const {
  mapStore,
  upgradeStore,
  showPicker,
  showMenu,
  handleMouseEnter,
  handleMouseLeave,
  slotData,
  isBoosting,
  cooldown,
  progressPercent,
  availableBuildings,
  handleClick,
  placeBuilding,
  boost,
  destroy,
  formatNumber,
  formatTime,
  getIcon,
  getSpriteUrl
} = useMapSlot(props.slotIndex);

const closeAll = () => {
  showPicker.value = false;
  showMenu.value = false;
};

watch([showPicker, showMenu], ([newPicker, newMenu]) => {
  if (newPicker || newMenu) {
    setTimeout(() => {
      window.addEventListener('click', closeAll);
    }, 0);
  } else {
    window.removeEventListener('click', closeAll);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('click', closeAll);
});

const formatBuildingName = (id: string): string => {
  const mapping: Record<string, string> = {
    'GARAGE': 'Garage automobile',
    'CARROSSIER': 'Atelier carrosserie',
    'CONCESSION': 'Concessionnaire'
  };
  return mapping[id.toUpperCase()] || id.charAt(0).toUpperCase() + id.slice(1).toLowerCase();
};

const getBuildingStats = (id: string): string => {
  const upperId = id.toUpperCase();
  const upg = upgradeStore.config?.upgrades[upperId];
  if (!upg) return '';
  const bonus = upg.bonusValueBonus || 0;
  const interval = upgradeStore.getBuildingInterval(upperId) / 1000;
  return `+${bonus} ✨ / ${interval.toFixed(0)}s`;
};
</script>


<style src="../../styles/clicker/mapSlot.css" scoped></style>
