<script setup lang="ts">
import { useRPlaceStore } from '@/stores/rplace';
import { storeToRefs } from 'pinia';

const store = useRPlaceStore();
const { isBrushActive, brushTotalPrice, brushSize } = storeToRefs(store);
</script>

<template>
  <Transition name="fade-right">
    <div v-if="isBrushActive" class="brush-settings">
      <div class="brush-header">
        <span class="brush-title">Prix : {{ brushTotalPrice }} ✨</span>
      </div>
      <div class="brush-options">
        <button 
          class="brush-opt-btn locked" 
          :class="{ active: brushSize === 3 }"
          @click="store.brushSize = 3"
          title="3x3"
        >
          <span class="btn-text">3x3</span>
          <span class="lock-icon">🔒</span>
        </button>
        <button 
          class="brush-opt-btn locked" 
          :class="{ active: brushSize === 5 }"
          @click="store.brushSize = 5"
          title="5x5"
        >
          <span class="btn-text">5x5</span>
          <span class="lock-icon">🔒</span>
        </button>
        <button 
          class="brush-opt-btn locked" 
          :class="{ active: brushSize === 7 }"
          @click="store.brushSize = 7"
          title="7x7"
        >
          <span class="btn-text">7x7</span>
          <span class="lock-icon">🔒</span>
        </button>
        <button 
          class="brush-opt-btn locked" 
          :class="{ active: brushSize === 9 }"
          @click="store.brushSize = 9"
          title="9x9"
        >
          <span class="btn-text">9x9</span>
          <span class="lock-icon">🔒</span>
        </button>
      </div>
    </div>
  </Transition>
</template>
