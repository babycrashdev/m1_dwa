<template>
  <div class="rplace-container">
    <RPlaceBoard v-if="store.gridSize > 0" />
    <div v-if="store.gridSize > 0" class="rplace-ui">
      <CooldownTimer />
    </div>
  </div>
</template>


<script setup lang="ts">
import { useRPlace } from '../scripts/rplace';
import RPlaceBoard from './rplace/RPlaceBoard.vue';
import CooldownTimer from './rplace/CooldownTimer.vue';

const { store } = useRPlace();
</script>

<style src="../styles/rplace.css" scoped></style>
