<!-- Temporaire -->
<template>
  <div class="city-map">
    <div class="grid-container">
      <div v-for="i in 32" :key="i" class="grid-slot" :class="{ 'is-road': isRoad(i) }">
        <span v-if="isRoad(i)" class="road-mark"></span>
        <span v-else class="slot-plus">+</span>
      </div>
    </div>
    <div class="city-label">VILLE</div>
  </div>
</template>

<script setup lang="ts">
import { useCityMap } from '../../scripts/clicker/cityMap';
const { isRoad } = useCityMap();
</script>

<style src="../../styles/clicker/cityMap.css" scoped></style>
