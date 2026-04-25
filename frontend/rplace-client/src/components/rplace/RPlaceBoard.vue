<template>
  <div class="board-wrapper">
    <canvas ref="canvasRef"></canvas>

    <Transition name="fade">
      <div 
        v-if="hoveredPixelData" 
        class="pixel-tooltip"
        :style="{ left: mousePos.x + 15 + 'px', top: mousePos.y + 15 + 'px' }"
      >
        <div class="tooltip-header">
          <div class="color-preview" :style="{ backgroundColor: hoveredPixelData.color }"></div>
          <span class="coordinates">({{ hoveredPixelData.x }}, {{ hoveredPixelData.y }})</span>
        </div>
        
        <div class="tooltip-body">
          <div class="info-row">
            <span class="label">Propriétaire</span>
            <span class="value">{{ hoveredPixelData.ownerName || 'Personne' }}</span>
          </div>
          <div class="info-row">
            <span class="label">Prix</span>
            <span class="value highlight">✨ {{ hoveredPixelData.price }}</span>
          </div>
          <div class="info-row" v-if="hoveredPixelData.lastModifiedAt">
            <span class="label">Dernière modif.</span>
            <span class="value small">{{ formatDate(hoveredPixelData.lastModifiedAt) }}</span>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { useRPlaceBoard } from '../../scripts/rplace/rplaceBoard';

const { 
  canvasRef, 
  mousePos, 
  hoveredPixelData, 
  formatDate 
} = useRPlaceBoard();
</script>

<style src="../../styles/rplace/rplaceBoard.css" scoped></style>


