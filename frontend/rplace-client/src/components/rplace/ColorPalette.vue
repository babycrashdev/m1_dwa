<template>
  <div v-if="isAuthenticated" class="palette-outer">
    <div class="palette-container" ref="scrollContainer" @scroll="handleScroll">
      <div 
        v-for="color in colors" 
        :key="color" 
        class="color-swatch"
        :class="{ active: color === selectedColor, locked: isLocked(color) }"
        :style="{ backgroundColor: color }"
        @click="handleColorClick(color)"
      >
        <span v-if="isLocked(color)" class="lock-emoji">🔒</span>
      </div>
    </div>

    <div class="palette-scroll-track">
      <div 
        class="palette-scroll-thumb" 
        :style="{ 
          width: thumbWidth + '%',
          left: (scrollProgress * (100 - thumbWidth)) + '%' 
        }"
      ></div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { useColorPalette } from '../../scripts/rplace/colorPalette.ts';

const { 
  colors, 
  selectedColor, 
  isAuthenticated, 
  isLocked, 
  handleColorClick, 
  scrollContainer,
  scrollProgress,
  thumbWidth,
  handleScroll
} = useColorPalette();
</script>

<style src="../../styles/rplace/colorPanel.css" scoped></style>
