<template>
  <div class="manual-spawner" @click="addWeight">
    <div class="spawner-building">
      <img :src="entrepotImg" alt="Entrepot" class="building-img" />
      
      <div class="spawner-ui">
        <button class="spawn-btn">
          <div class="weight-badge" v-if="currentWeight === 0">
            x0
          </div>
          <div class="weight-badge" v-else>
            x{{ formatNumber(currentWeight) }}
          </div>
        </button>
      </div>

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
    </div>
  </div>
</template>

<script setup lang="ts">
import { useManualSpawner } from '../../scripts/clicker/manualSpawner';
import { formatNumber } from '../../scripts/common/formatNumber';
import entrepotImg from '../../assets/building/entrepot.png';

const { addWeight, currentWeight, progress } = useManualSpawner();
</script>

<style src="../../styles/clicker/manualSpawner.css" scoped></style>
