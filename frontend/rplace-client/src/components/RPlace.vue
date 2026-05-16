<template>
  <div class="rplace-container">
    <RPlaceBoard v-if="store.gridSize > 0" />
    <div v-if="store.gridSize > 0" class="rplace-ui">
      <CooldownTimer />
    </div>

    <div class="area-scoreboard" :class="{ 'is-open': isScoreboardOpen }">
        <Scoreboard @close="isScoreboardOpen = false" />
        <button class="panel-toggle panel-toggle--scoreboard" @click="isScoreboardOpen = !isScoreboardOpen" :title="isScoreboardOpen ? 'Fermer' : 'Classement'">
          <span class="toggle-icon">{{ isScoreboardOpen ? '🏆' : '🏆' }}</span>
        </button>
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
const isScoreboardOpen = ref(true);
</script>

<style src="../styles/rplace.css" scoped></style>
