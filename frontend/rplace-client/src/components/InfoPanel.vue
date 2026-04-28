<template>
  <div class="info-panel">
    <h3>{{ title }}</h3>
    
    <div class="info-content">
      <div class="info-row-split">
        <span class="split-left">{{ coordinateLabel }}</span>
        <span class="split-right">{{ coordinateValue }}</span>
      </div>

      <div class="info-row-normal">
        {{ lastUser }}
      </div>
      
      <div class="info-row-normal">
        {{ lastTime }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useInfoPanel } from '../scripts/infoPanel';
const { title, coordinateLabel, coordinateValue, lastUser, lastTime } = useInfoPanel();
</script>

<style src="../styles/infoPanel.css" scoped></style>
