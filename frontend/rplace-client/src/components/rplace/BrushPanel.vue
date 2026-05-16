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
            locked: isLocked(size, brushShape) 
          }"
          @click="handleBrushClick(size)"
          :title="formatBrushName(size, brushShape)"
        >
          <span class="btn-text">{{ formatBrushName(size, brushShape) }}</span>
          <span v-if="isLocked(size, brushShape)" class="lock-icon">🔒</span>
        </button>
      </div>
      
      <Teleport to="body">
        <div v-if="showBuyModal" class="modal-overlay" @click.self="showBuyModal = false">
          <div class="modal-content">
            <h3>Débloquer ce Pinceau ?</h3>
            
            <div class="brush-preview-icon">
              <svg :width="60" :height="60" viewBox="0 0 100 100" class="brush-grid-svg">
                <template v-for="y in brushToBuySizeNum">
                  <template v-for="x in brushToBuySizeNum">
                    <rect 
                      v-if="brushToBuy.startsWith('C') ? 
                        (Math.pow(x - 1 - (brushToBuySizeNum-1)/2, 2) + Math.pow(y - 1 - (brushToBuySizeNum-1)/2, 2) <= Math.pow((brushToBuySizeNum-0.5)/2, 2)) : 
                        true"
                      :key="`${x}-${y}`"
                      :x="(x-1) * (100 / brushToBuySizeNum) + 2"
                      :y="(y-1) * (100 / brushToBuySizeNum) + 2"
                      :width="(100 / brushToBuySizeNum) - 4"
                      :height="(100 / brushToBuySizeNum) - 4"
                      :rx="brushToBuy.startsWith('C') ? '100' : '2'"
                      fill="currentColor"
                    />
                  </template>
                </template>
              </svg>
              <span class="btn-text">{{ formatUpgradeId(brushToBuy) }}</span>
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
  brushShape,
  handleShapeChange,
  brushToBuySizeNum,
  brushToBuyPrice,
  formatBrushName,
  formatUpgradeId
} = useBrushPanel();
</script>

<style src="../../styles/rplace/brushPanel.css" scoped></style>
