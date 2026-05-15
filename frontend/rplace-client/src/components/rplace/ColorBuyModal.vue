<template>
  <Teleport to="body">
    <div v-if="store.showBuyModal" class="modal-overlay" @click.self="close">
      <div class="modal-content">
        <h3>Débloquer cette couleur ?</h3>
        
        <div class="color-swatch-preview" :style="{ backgroundColor: store.colorToBuy }"></div>
        
        <div class="modal-actions">
          <button class="buy-btn" @click="store.confirmColorPurchase" :disabled="store.isBuying">
            <span>500</span>
            <span class="money-icon">✨</span>
          </button>
          
          <button class="cancel-btn" @click="close">
            Plus tard
          </button>
        </div>
        
        <p v-if="store.errorMessage" class="error-msg">{{ store.errorMessage }}</p>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useRPlaceStore } from '../../stores/rplace';

const store = useRPlaceStore();

const close = () => {
  if (!store.isBuying) {
    store.showBuyModal = false;
  }
};
</script>

<style src="../../styles/rplace/colorBuyModal.css" scoped></style>
