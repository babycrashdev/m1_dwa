<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRPlaceStore } from '@/stores/rplace';
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';

const store = useRPlaceStore();
const authStore = useAuthStore();
const { isBrushActive, brushTotalPrice, brushSize, ownedBrushes } = storeToRefs(store);

const showBuyModal = ref(false);
const brushToBuy = ref('');
const isBuying = ref(false);
const errorMessage = ref('');

const prices: Record<string, number> = {
  "3x3": 500,
  "5x5": 1000,
  "7x7": 2500,
  "9x9": 5000
};

const isLocked = (size: string) => {
  return !ownedBrushes.value.includes(size);
};

const handleBrushClick = (size: number) => {
  const sizeStr = `${size}x${size}`;
  if (isLocked(sizeStr)) {
    brushToBuy.value = sizeStr;
    showBuyModal.value = true;
    errorMessage.value = '';
  } else {
    store.brushSize = size;
  }
};

const confirmPurchase = async () => {
  isBuying.value = true;
  errorMessage.value = '';
  try {
    await store.buyBrush(brushToBuy.value);
    showBuyModal.value = false;
    store.brushSize = parseInt(brushToBuy.value.split('x')[0]);
  } catch (err: any) {
    errorMessage.value = err.message;
  } finally {
    isBuying.value = false;
  }
};

onMounted(() => {
  if (authStore.isAuthenticated) {
    store.fetchOwnedBrushes();
  }
});
</script>

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
      <!-- Généré par IA -->
      <Teleport to="body">
        <div v-if="showBuyModal" class="modal-overlay" @click.self="showBuyModal = false">
          <div class="modal-content">
            <h3>Débloquer ce Pinceau ?</h3>
            <div class="brush-preview-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ffd700" stroke-width="2">
                <path d="M12 19l7-7 3 3-7 7-3-3z"/>
                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
                <path d="M2 2l5 5"/>
                <path d="M11 11l1 1"/>
              </svg>
            </div>
            <p class="upgrade-name">Mode {{ brushToBuy }}</p>
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
