<template>
  <Transition name="fade">
    <div v-if="rplaceStore.hoveredPixelData" class="pixel-info-box">
      <div class="tooltip-header">
        <div class="color-preview" :style="{ backgroundColor: rplaceStore.hoveredPixelData.color }"></div>
        <span class="coordinates">({{ rplaceStore.hoveredPixelData.x }}, {{ rplaceStore.hoveredPixelData.y }})</span>
      </div>
      
      <div class="tooltip-body">
        <div class="info-row">
          <span class="label">Propriétaire</span>
          <span class="value">{{ rplaceStore.hoveredPixelData.ownerName || 'Personne' }}</span>
        </div>
        <div class="info-row">
          <span class="label">Prix</span>
          <span class="value highlight">✨ {{ rplaceStore.hoveredPixelData.price }}</span>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useRPlaceStore } from '../../stores/rplace.ts';

const rplaceStore = useRPlaceStore();
</script>

<style src="../../styles/rplace/infoPixel.css" scoped></style>

