<template>
  <div class="rplace-container">
    <RPlaceBoard v-if="store.gridSize > 0" />
    <div v-if="store.gridSize > 0" class="rplace-ui">
      <CooldownTimer />
    </div>

    <!-- FAIT PAR IA EN DESSOUS -->
    <div 
      class="area-scoreboard"
      :class="{ 
        'is-open': isScoreboardOpen && !isAnyModalOpen,
        'is-dimmed': isAnyModalOpen
      }" 
      @click="handleScoreboardClick"
    >
      <Scoreboard 
        :is-open="isScoreboardOpen && !isAnyModalOpen" 
        @toggle="toggleScoreboard" 
      />
      <!-- FAIT PAR IA AU DESSUS -->
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRPlace } from '../scripts/rplace';
import { useAppStore } from '../stores/app';
import RPlaceBoard from './rplace/RPlaceBoard.vue';
import CooldownTimer from './rplace/CooldownTimer.vue';
import Scoreboard from './rplace/Scoreboard.vue';

const { store } = useRPlace();
const appStore = useAppStore();
const isScoreboardOpen = ref(false);

/* FAIT PAR IA EN DESSOUS */
const isAnyModalOpen = computed(() => {
  return appStore.showAuth || appStore.showRules;
});

const toggleScoreboard = () => {
  if (isAnyModalOpen.value) return;
  isScoreboardOpen.value = !isScoreboardOpen.value;
};

const handleScoreboardClick = () => {
  if (isAnyModalOpen.value) return;
  if (!isScoreboardOpen.value) {
    isScoreboardOpen.value = true;
  }
};

// Auto-close scoreboard when a modal opens
watch(isAnyModalOpen, (isOpen) => {
  if (isOpen) {
    isScoreboardOpen.value = false;
  }
});
/* FAIT PAR IA AU DESSUS */
</script>

<style src="../styles/rplace.css" scoped></style>
