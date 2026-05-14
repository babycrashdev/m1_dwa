<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="store.showBuyModal" class="modal-overlay" @click.self="close">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Débloquer cette couleur ?</h3>
            <button class="close-icon-btn" @click="close">&times;</button>
          </div>
          
          <div class="modal-body">
            <div class="color-preview-container">
              <div class="color-circle" :style="{ backgroundColor: store.colorToBuy }"></div>
              <span class="color-hex">{{ store.colorToBuy }}</span>
            </div>
            
            <p class="description">
              Cette couleur est actuellement verrouillée. Voulez-vous la débloquer pour votre collection ?
            </p>
            
            <div class="price-tag">
              <span class="label">Prix</span>
              <span class="value">500 moneys</span>
            </div>
          </div>

          <div class="modal-actions">
            <button 
              class="confirm-btn" 
              @click="store.confirmColorPurchase" 
              :disabled="store.isBuying"
            >
              <span v-if="!store.isBuying">Débloquer</span>
              <span v-else class="loader"></span>
            </button>
            <button class="cancel-btn" @click="close" :disabled="store.isBuying">Plus tard</button>
          </div>
          
          <Transition name="slide-up">
            <p v-if="store.errorMessage" class="error-msg">{{ store.errorMessage }}</p>
          </Transition>
        </div>
      </div>
    </Transition>
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
