<template>
  <div class="palette-container">
    <div 
      v-for="color in colors" 
      :key="color" 
      class="color-swatch"
      :style="{ backgroundColor: color }"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { useColorPalette } from '../../scripts/rplace/colorPalette';

const { colors } = useColorPalette();
</script>

<style src="../../styles/rplace/colorPalette.css" scoped></style>
