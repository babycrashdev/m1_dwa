<template>
  <div v-if="isAuthenticated" class="palette-outer">
    <div class="palette-container" ref="scrollContainer" @scroll="handleScroll">
      <div 
        v-for="color in colors" 
        :key="color" 
        class="color-swatch"
        :class="{ active: color === selectedColor, locked: isLocked(color) }"
        :style="{ backgroundColor: color }"
        @click="handleColorClick(color)"
      >
        <span v-if="isLocked(color)" class="lock-emoji">🔒</span>
      </div>
    </div>

    <div class="palette-scroll-track">
      <div 
        class="palette-scroll-thumb" 
        :style="{ 
          width: thumbWidth + '%',
          left: (scrollProgress * (100 - thumbWidth)) + '%' 
        }"
      ></div>
    </div>

    <Teleport to="body">
      <div v-if="showBuyModal" class="modal-overlay" @click.self="showBuyModal = false">
        <div class="modal-content">
          <h3>Acheter cette couleur ?</h3>
          <div class="color-swatch-preview" :style="{ backgroundColor: colorToBuy }"></div>
          <p class=upgrade-price>Prix : 500 moneys</p>
          <div class="modal-actions">
            <button class="buy-btn" @click="confirmPurchase" :disabled="isBuying">
              {{ isBuying ? 'Achat...' : 'Payer' }}
            </button>
            <button class="cancel-btn" @click="showBuyModal = false">Annuler</button>
          </div>
          <p v-if="errorMessage" class="error-msg">{{ errorMessage }}</p>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { useColorPalette } from '../../scripts/rplace/colorPalette.ts';

const { 
  colors, 
  selectedColor, 
  isAuthenticated, 
  isLocked, 
  handleColorClick, 
  confirmPurchase, 
  showBuyModal, 
  colorToBuy, 
  isBuying, 
  errorMessage,
  scrollContainer,
  scrollProgress,
  thumbWidth,
  handleScroll
} = useColorPalette();
</script>

<style src="../../styles/rplace/colorPanel.css" scoped></style>
