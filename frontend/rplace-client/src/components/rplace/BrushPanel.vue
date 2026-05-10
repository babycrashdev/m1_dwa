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
              <button class="brush-opt-btn-preview active" style="pointer-events: none;">
                <span class="btn-text">{{ brushToBuy }}</span>
              </button>
            </div>
            
            <p class="upgrade-price">Prix : {{ prices[brushToBuy] }} moneys</p>
            
            <div class="modal-actions">
              <button class="buy-btn" @click="confirmPurchase" :disabled="isBuying">
                {{ isBuying ? 'Achat...' : 'Débloquer' }}
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
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useBrushPanelStore } from '@/stores/rplace/brushPanel';
import { storeToRefs } from 'pinia';

const authStore = useAuthStore();
const brushStore = useBrushPanelStore();
const { 
  isBrushActive, 
  brushTotalPrice, 
  brushSize, 
  ownedBrushes,
  showBuyModal,
  brushToBuy,
  isBuying,
  errorMessage
} = storeToRefs(brushStore);

const { handleBrushClick, confirmPurchase, isLocked, prices } = brushStore;

onMounted(() => {
  if (authStore.isAuthenticated) {
    brushStore.fetchOwnedBrushes();
  }
});
</script>

<style src="../../styles/rplace/brushPanel.css" scoped></style>
