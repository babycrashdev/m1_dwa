<template>
  <div 
    class="map-slot" 
    :class="{ 
      locked: !slotData?.unlocked, 
      empty: slotData?.unlocked && !slotData?.buildingType,
      occupied: slotData?.buildingType,
      'picker-open': showPicker
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

    <div v-if="showPicker" class="building-picker-overlay" @click.stop="showPicker = false">
      <div class="picker-card" @click.stop>
        <h3>Choisir un bâtiment</h3>
        <div class="picker-grid">
          <div 
            v-for="b in availableBuildings" 
            :key="b.id" 
            class="picker-item"
            @click="placeBuilding(b.id)"
          >
            <span class="p-icon">
              <img :src="getSpriteUrl(b.id)" :alt="b.id" />
            </span>
            <span class="p-name">{{ b.id }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showMenu" class="slot-menu-overlay" @click.stop="showMenu = false">
      <div class="menu-card" @click.stop>
        <button 
          class="menu-btn boost" 
          :class="{ disabled: isBoosting || cooldown > 0 }"
          @click="boost"
        >
          {{ isBoosting ? 'Boost Actif' : (cooldown > 0 ? formatTime(cooldown) : '🚀 BOOST') }}
        </button>
        <button class="menu-btn destroy" @click="destroy">🗑️ Détruire</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMapSlot } from '../../scripts/clicker/mapSlot';

const props = defineProps<{
  slotIndex: number
}>();

const {
  mapStore,
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
</script>

<style src="../../styles/clicker/mapSlot.css" scoped></style>
