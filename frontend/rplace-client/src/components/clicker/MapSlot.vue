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
      <div class="building-sprite">
        {{ getIcon(slotData.buildingType) }}
      </div>

      <div class="slot-progress-container">
        <div 
          class="slot-progress-bar" 
          :class="{ boosting: isBoosting }"
          :style="{ width: progressPercent + '%' }"
        ></div>
      </div>

      <div v-if="isBoosting" class="boost-tag">⚡ BOOST</div>
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
            <span class="p-icon">{{ getIcon(b.id) }}</span>
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
  getIcon
} = useMapSlot(props.slotIndex);
</script>

<style src="../../styles/clicker/mapSlot.css" scoped></style>
