<!-- Généré par IA -->
 
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
            locked: isLocked(`${size}x${size}`) 
          }"
          @click="handleBrushClick(size)"
          :title="`${size}x${size}`"
        >
          <span class="btn-text">{{ size }}x{{ size }}</span>
          <span v-if="isLocked(`${size}x${size}`)" class="lock-icon">🔒</span>
        </button>
      </div>
      
      <Teleport to="body">
        <div v-if="showBuyModal" class="modal-overlay" @click.self="showBuyModal = false">
          <div class="modal-content">
            <h3>Débloquer ce Pinceau ?</h3>
            
            <div class="brush-preview-icon">
              <svg :width="60" :height="60" viewBox="0 0 100 100" class="brush-grid-svg">
                <rect 
                  v-for="i in (brushToBuySizeNum * brushToBuySizeNum)" 
                  :key="i"
                  :x="((i-1) % brushToBuySizeNum) * (100 / brushToBuySizeNum) + 2"
                  :y="Math.floor((i-1) / brushToBuySizeNum) * (100 / brushToBuySizeNum) + 2"
                  :width="(100 / brushToBuySizeNum) - 4"
                  :height="(100 / brushToBuySizeNum) - 4"
                  rx="2"
                  fill="currentColor"
                />
              </svg>
              <span class="btn-text">{{ brushToBuy }}</span>
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
  showBuyModal,
  brushToBuy,
  isBuying,
  errorMessage,
  prices,
  handleBrushClick,
  confirmPurchase,
  isLocked,
  brushToBuySizeNum,
  brushToBuyPrice
} = useBrushPanel();
</script>

<style src="../../styles/rplace/brushPanel.css" scoped></style>
