<!-- Temporaire -->
<template>
  <div class="manual-spawner">
    <button @click="addWeight" class="spawn-btn">
      <!-- Barre de progression en arrière-plan -->
      <!-- <div class="progress-fill" :style="{ height: progress + '%' }"></div> -->
      
      <div class="btn-content">
        <div class="car-icon">🚗</div>
        <div class="weight-info" v-if="currentWeight > 0">
          x{{ formatNumber(currentWeight) }}
        </div>
      </div>

      <!-- Badge indiquant le temps restant (visuel) -->
      <div class="timer-ring">
        <svg viewBox="0 0 36 36" class="circular-chart">
          <path class="circle-bg"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path class="circle"
            :stroke-dasharray="progress + ', 100'"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useManualSpawner } from '../../scripts/clicker/manualSpawner';
import { formatNumber } from '../../scripts/formatNumber';
const { addWeight, currentWeight, progress } = useManualSpawner();
</script>

<style src="../../styles/clicker/manualSpawner.css" scoped></style>
