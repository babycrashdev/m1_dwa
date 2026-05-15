<template>
  <Transition name="fade-right">
    <div v-if="isBrushActive" class="brush-settings">
      <div class="brush-header">
        <span class="brush-title">Prix : {{ brushTotalPrice }} ✨</span>
      </div>
      <div class="brush-options">
        <button 
          v-for="size in [3, 5, 7, 9]"
          :key="size"
          class="brush-opt-btn" 
          :class="{ 
            active: brushSize === size, 
            locked: isLocked(size) 
          }"
          @click="handleBrushClick(size)"
          :title="brushShape === 'square' ? `${size}x${size}` : `Cercle ${size}`"
        >
          <span class="btn-text">{{ size }}x{{ size }}</span>
          <span v-if="isLocked(size)" class="lock-icon">🔒</span>
        </button>
      </div>
      
      <Teleport to="body">
        <div v-if="showBuyModal" class="modal-overlay" @click.self="showBuyModal = false">
          <div class="modal-content">
            <h3>Débloquer ce Pinceau ?</h3>
            
            <div class="brush-preview-icon" :class="brushToBuy.startsWith('C') ? 'preview-circle' : 'preview-square'">
              <svg :width="100" :height="100" viewBox="0 0 100 100" class="brush-grid-svg">
                <template v-if="!brushToBuy.startsWith('C')">
                  <rect 
                    v-for="i in (brushToBuySizeNum * brushToBuySizeNum)" 
                    :key="i"
                    :x="((i-1) % brushToBuySizeNum) * (100 / brushToBuySizeNum) + 1"
                    :y="Math.floor((i-1) / brushToBuySizeNum) * (100 / brushToBuySizeNum) + 1"
                    :width="(100 / brushToBuySizeNum) - 2"
                    :height="(100 / brushToBuySizeNum) - 2"
                    rx="2"
                    fill="currentColor"
                  />
                </template>
                <template v-else>
                  <circle
                    v-for="i in (brushToBuySizeNum * brushToBuySizeNum)"
                    :key="'c'+i"
                    v-show="isPixelInPreviewCircle((i-1) % brushToBuySizeNum, Math.floor((i-1) / brushToBuySizeNum), brushToBuySizeNum)"
                    :cx="((i-1) % brushToBuySizeNum) * (100 / brushToBuySizeNum) + (50 / brushToBuySizeNum)"
                    :cy="Math.floor((i-1) / brushToBuySizeNum) * (100 / brushToBuySizeNum) + (50 / brushToBuySizeNum)"
                    :r="(50 / brushToBuySizeNum) - 2"
                    fill="currentColor"
                  />
                </template>
              </svg>
              <span class="btn-text">{{ brushToBuy.startsWith('C') ? 'Cercle ' + brushToBuy.charAt(1) + 'x' + brushToBuy.charAt(1) : brushToBuy }}</span>
            </div>
            
            <div class="modal-actions">
              <button class="buy-btn" @click="confirmPurchase" :disabled="isBuying">
                {{ isBuying ? 'Achat...' : `${brushToBuyPrice} ✨` }}
              </button>
              <button class="cancel-btn" @click="showBuyModal = false">Plus tard</button>
            </div>
            
            <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>
          </div>
        </div>
      </Teleport>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { useBrushPanel } from '../../scripts/rplace/brushPanel';

const { 
  isBrushActive, 
  brushTotalPrice, 
  brushSize, 
  brushShape,
  showBuyModal,
  brushToBuy,
  isBuying,
  errorMessage,
  handleBrushClick,
  confirmPurchase,
  isLocked,
  brushToBuySizeNum,
  brushToBuyPrice
} = useBrushPanel();

const isPixelInPreviewCircle = (x: number, y: number, size: number) => {
  const radius = (size - 1) / 2;
  const dx = x - radius;
  const dy = y - radius;
  return (dx * dx + dy * dy) <= (radius * radius) + 0.1;
};
</script>

<style src="../../styles/rplace/brushPanel.css" scoped></style>
<style scoped>
.brush-preview-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin: 20px 0;
  color: white;
}

.brush-grid-svg {
  filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.2));
}

.preview-circle {
  color: #a78bfa; /* Light purple for circles */
}

.preview-square {
  color: #60a5fa; /* Light blue for squares */
}
</style>
