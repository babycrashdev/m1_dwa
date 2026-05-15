<template>
  <div class="rplace-container">
    <RPlaceBoard v-if="store.gridSize > 0" />
    <div v-if="store.gridSize > 0" class="rplace-ui">
      <CooldownTimer />
    </div>

    <div 
      class="area-scoreboard" 
      :class="{ 'is-open': isScoreboardOpen }" 
      @click="!isScoreboardOpen ? isScoreboardOpen = true : null"
    >
      <Scoreboard :is-open="isScoreboardOpen" @toggle="isScoreboardOpen = !isScoreboardOpen" />
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref } from 'vue';
import { useRPlace } from '../scripts/rplace';
import RPlaceBoard from './rplace/RPlaceBoard.vue';
import CooldownTimer from './rplace/CooldownTimer.vue';
import Scoreboard from './rplace/Scoreboard.vue';

const { store } = useRPlace();
const isScoreboardOpen = ref(false);
</script>

<style src="../styles/rplace.css" scoped></style>
