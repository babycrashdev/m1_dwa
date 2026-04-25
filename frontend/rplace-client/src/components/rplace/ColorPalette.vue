<template>
  <div v-if="isAuthenticated" class="palette-container">
    <div 
      v-for="color in colors" 
      :key="color" 
      class="color-swatch"
      :class="{ active: color === selectedColor }"
      :style="{ backgroundColor: color }"
      @click="selectColor(color)"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { useColorPalette } from '../../scripts/rplace/colorPalette';

const { colors, selectedColor, selectColor, isAuthenticated } = useColorPalette();
</script>

<style src="../../styles/rplace/colorPalette.css" scoped></style>
