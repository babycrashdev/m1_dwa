<template>
  <div class="pipette-container">
    <button 
      @click="toggle" 
      class="pipette-btn"
      :class="{ 'active': isActive }"
      title="Pipette (Choisir une couleur sur la carte)"
    >
      <!-- Généré par IA tout svg-->
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m2 22 1-1h3l9-9"/>
        <path d="M3 21v-3l9-9"/>
        <path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l-3-3Z"/>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { usePipetteStore } from '../../stores/rplace/pipette';
import { storeToRefs } from 'pinia';

const pipetteStore = usePipetteStore();
const { isActive } = storeToRefs(pipetteStore);

const toggle = () => {
  pipetteStore.isActive = !pipetteStore.isActive;
};
</script>

<style src="../../styles/rplace/pipette.css" scoped></style>
