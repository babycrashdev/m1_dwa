<template>
  <div class="board-wrapper">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<script setup lang="ts">
import { useRPlaceBoard } from '../../scripts/rplace/rplaceBoard.ts';

const { 
  canvasRef, 
  mousePos, 
  hoveredPixelData, 
  formatDate 
} = useRPlaceBoard();
</script>

<style src="../../styles/rplace/rplaceBoard.css" scoped></style>


