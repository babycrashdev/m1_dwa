<!-- Generer par IA-->

<template>
  <div class="city-map-container">
    <div class="city-grid">
      <div 
        v-for="(tile, index) in CITY_TILES" 
        :key="index"
        :class="['tile', tile.type === 'ROAD' ? 'road-tile' : (tile.type === 'ACTION' ? 'action-case' : 'empty-tile')]"
        :style="{ gridColumn: tile.x + 1, gridRow: tile.y + 1 }"
      >
        <MapSlot 
          v-if="tile.type === 'ACTION' && tile.slotIndex !== undefined" 
          :slotIndex="tile.slotIndex" 
        />
      </div>
    </div>

    <svg class="animation-layer" viewBox="0 0 700 400" preserveAspectRatio="xMinYMid meet">
      <path id="delivery-path" :d="CITY_SVG_PATH" fill="none" />
      
      <CarSprite 
        v-for="delivery in deliveryStore.activeDeliveries" 
        :key="delivery.id"
        :delivery="delivery"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { CITY_TILES, CITY_SVG_PATH } from '../../scripts/clicker/mapConfig';
import { useCityMapLogic } from '../../scripts/clicker/cityMapLogic';
import { useDeliveryStore } from '../../stores/clicker/deliveryStore';
import CarSprite from './CarSprite.vue';
import MapSlot from './MapSlot.vue';

const deliveryStore = useDeliveryStore();
const { handleActionClick } = useCityMapLogic();
</script>

<style src="../../styles/clicker/cityMap.css" scoped></style>
