<template>
  <div class="scoreboard-preview" @click="$emit('open')">
    <div class="scoreboard-preview__header">
      <h3 class="scoreboard-preview__title">🏆 CLASSEMENT</h3>
    </div>
    
    <div class="scoreboard-preview__list">
      <div 
        v-for="entry in topFivePixels" 
        :key="entry.username"
        class="preview-item"
        :class="{ 'preview-item--me': entry.username === currentUsername }"
      >
        <div class="preview-item__rank">
          <span v-if="entry.originalRank === 1">🥇</span>
          <span v-else-if="entry.originalRank === 2">🥈</span>
          <span v-else-if="entry.originalRank === 3">🥉</span>
          <span v-else class="rank-num">#{{ entry.originalRank }}</span>
        </div>
        
        <div class="preview-item__name">
          {{ entry.username }}
          <span v-if="entry.username === currentUsername" class="me-tag"></span>
        </div>
        
        <div class="preview-item__score">
          {{formatPercent(entry.totalPixels)}}
          <span class="score-pct">({{formatNumber(entry.totalPixels)}})</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useScoreboardLogic } from '../../scripts/rplace/scoreboard';

defineEmits(['open']);

const {
  topFivePixels,
  currentUsername,
  formatNumber,
  formatPercent
} = useScoreboardLogic();
</script>

<style src="../../styles/rplace/scoreboardPreview.css" scoped></style>
