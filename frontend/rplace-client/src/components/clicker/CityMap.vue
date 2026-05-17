<!-- Utilisation en partie de l'IA -->

<template>
  <div class="city-map-container">
    <div class="city-grid">
      <div 
        v-for="(tile, index) in CITY_TILES" 
        :key="index"
        :class="['tile', tile.type === 'ROAD' ? 'road-tile' : (tile.type === 'ACTION' ? 'action-case' : 'empty-tile')]"
        :style="{ gridColumn: tile.x + 1, gridRow: tile.y + 1 }"
      >
        <div v-if="tile.type === 'ROAD' && tile.x === 1 && tile.y === 0" class="depot-icon">
          <img :src="arriverImg" alt="Depot" class="depot-img" />
        </div>
        <MapSlot 
          v-if="tile.type === 'ACTION' && tile.slotIndex !== undefined" 
          :slotIndex="tile.slotIndex" 
        />
      </div>
    </div>
  </div>

  <svg class="animation-layer-fixed" viewBox="0 0 700 400" preserveAspectRatio="xMinYMid meet">
    <path id="delivery-path" :d="CITY_SVG_PATH" fill="none" />
    
    <g 
      v-for="slot in mapStore.slots.filter(s => s.parcelPresent)"
      :key="'parcel-' + slot.slotIndex"
      :style="{ 
        offsetPath: `path('${CITY_SVG_PATH}')`, 
        offsetDistance: `${SLOT_PATH_PROGRESS[slot.slotIndex]}%`,
        offsetRotate: '0deg',
        position: 'absolute'
      }"
    >
      <image 
        :href="colisImg"
        width="40"
        height="40"
        x="-20"
        y="-20"
      />
    </g>

    <CarSprite 
      v-for="delivery in deliveryStore.activeDeliveries" 
      :key="delivery.id"
      :delivery="delivery"
    />
  </svg>
</template>

<script setup lang="ts">
import { CITY_TILES, CITY_SVG_PATH, SLOT_PATH_PROGRESS } from '../../scripts/clicker/mapConfig';
import { useCityMapLogic } from '../../scripts/clicker/cityMapLogic';
import { useDeliveryStore } from '../../stores/clicker/deliveryStore';
import { useMapStore } from '../../stores/clicker/mapStore';
import colisImg from '../../assets/colis.png';
import arriverImg from '../../assets/arriver.png';
import CarSprite from './CarSprite.vue';
import MapSlot from './MapSlot.vue';

const deliveryStore = useDeliveryStore();
const mapStore = useMapStore();
const { handleActionClick } = useCityMapLogic();
</script>

<style src="../../styles/clicker/cityMap.css" scoped></style>
