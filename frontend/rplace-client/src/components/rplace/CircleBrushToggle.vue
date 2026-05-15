<template>
  <div class="brush-container">
    <button 
      @click="toggle" 
      class="brush-toggle-btn"
      :class="{ 'active': isActive }"
      title="Pinceau Circulaire"
    >
      <div class="brush-content">
        <div class="pixel-grid-icon circle-grid">
          <div class="pixel-empty"></div><div class="pixel"></div><div class="pixel-empty"></div>
          <div class="pixel"></div><div class="pixel"></div><div class="pixel"></div>
          <div class="pixel-empty"></div><div class="pixel"></div><div class="pixel-empty"></div>
        </div>
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useBrushToggle } from '../../scripts/rplace/brushToggle.ts';

const { isActive, toggle } = useBrushToggle('circle');
</script>

<style src="../../styles/rplace/brushToggle.css" scoped></style>
<style scoped>
.pixel-empty {
  width: 6px;
  height: 6px;
}
</style>
