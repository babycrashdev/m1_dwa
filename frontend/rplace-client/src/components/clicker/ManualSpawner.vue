<!-- Temporaire -->
<template>
  <div class="manual-spawner">
    <button @click="spawnCar" class="spawn-btn">
      <div class="car-icon">🚗</div>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useManualSpawner } from '../../scripts/clicker/manualSpawner';
const { spawnCar } = useManualSpawner();
</script>

<style src="../../styles/clicker/manualSpawner.css" scoped></style>
