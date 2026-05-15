<template>
  <div class="scoreboard" :class="{ 'scoreboard--mini': !isOpen }">
    <div class="scoreboard__header">
      <div class="header-top">
        <h2 class="scoreboard__title">Classement</h2>
        <button v-if="isOpen" class="close-btn" @click.stop="$emit('toggle')">✕</button>
      </div>
      
      <div class="scoreboard__sort" v-if="isOpen">
        <button
          v-for="opt in sortOptions"
          :key="opt.key"
          class="sort-btn"
          :class="{ 'sort-btn--active': store.sortKey === opt.key }"
          @click="store.setSortKey(opt.key)"
        >
          {{ opt.icon }} {{ opt.label }}
        </button>
      </div>
    </div>

    <div class="scoreboard__body">
      <table class="scoreboard__table" v-if="displayEntries.length > 0">
        <thead v-if="isOpen">
          <tr>
            <th class="col-rank">#</th>
            <th>Joueur</th>
            <th class="col-score">🎨</th>
            <th class="col-score" v-if="isOpen">💰</th>
            <th class="col-score" v-if="isOpen">⏱️</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(entry, index) in displayEntries"
            :key="entry.username"
            :class="{ 'row--me': entry.username === currentUsername }"
          >
            <td class="rank-cell">
              <span class="rank-medal" v-if="index === 0">🥇</span>
              <span class="rank-medal" v-else-if="index === 1">🥈</span>
              <span class="rank-medal" v-else-if="index === 2">🥉</span>
              <span class="rank-number" v-else>{{ index + 1 }}</span>
            </td>

            <td>
              <div class="player-cell">
                <span class="player-name" :class="{ 'player-name--me': entry.username === currentUsername }">
                  {{ entry.username }}
                  <span v-if="entry.username === currentUsername && isOpen"> (moi)</span>
                </span>
                <span class="player-country" v-if="isOpen">{{ entry.country }}</span>
              </div>
            </td>

            <td class="score-cell">
              <span class="score-value score-value--quaternary"
                :class="{ 'score-value--active': store.sortKey === 'totalPixels' }">
                {{ formatNumber(entry.totalPixels) }}
              </span>
              <span class="score-value score-value--quaternary" v-if="isOpen"> ({{ formatPercent(entry.totalPixels) }})</span>
            </td>

            <td class="score-cell" v-if="isOpen">
              <span class="score-value score-value--primary"
                :class="{ 'score-value--active': store.sortKey === 'moneys' }">
                {{ formatNumber(entry.moneys) }}
              </span>
            </td>

            <td class="score-cell" v-if="isOpen">
              <span class="score-value score-value--active"
                :class="{ 'score-value--active': store.sortKey === 'pixelRecord' }">
                {{ formatTime(entry.pixelRecord) }}
              </span>
            </td>

          </tr>
        </tbody>
      </table>

      <div class="scoreboard__empty" v-else-if="!store.isLoading">
        Aucun joueur trouvé.
      </div>
    </div>
    
    <div class="scoreboard__footer" v-if="!isOpen">
      <span class="expand-hint">Cliquer pour voir tout le classement</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useScoreboardLogic } from '../../scripts/rplace/scoreboard.ts';

const props = defineProps<{
  isOpen: boolean
}>();

defineEmits(['toggle']);

const {
  store,
  currentUsername,
  sortOptions,
  sorted,
  formatPercent,
  formatNumber,
  formatTime
} = useScoreboardLogic();

const displayEntries = computed(() => {
  if (props.isOpen) return sorted.value;
  return sorted.value.slice(0, 5);
});
</script>

<style src="../../styles/rplace/scoreboard.css" scoped></style>
