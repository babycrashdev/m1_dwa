<template>
  <div class="brush-container">
    <button 
      @click="toggle" 
      class="brush-toggle-btn"
      :class="{ 'active': isActive }"
      title="Placer 9 pixels"
    >
      <div class="brush-content">
        <div class="pixel-grid-icon">
          <div class="pixel"></div><div class="pixel"></div><div class="pixel"></div>
          <div class="pixel"></div><div class="pixel"></div><div class="pixel"></div>
          <div class="pixel"></div><div class="pixel"></div><div class="pixel"></div>
        </div>
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useBrushToggle } from '../../scripts/rplace/brushToggle.ts';

const { isActive, toggle } = useBrushToggle();
</script>

<style src="../../styles/rplace/brushToggle.css" scoped></style>
