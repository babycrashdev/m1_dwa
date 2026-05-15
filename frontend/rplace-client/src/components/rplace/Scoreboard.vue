<template>
  <div class="scoreboard" :class="{ 'scoreboard--mini': !isOpen }">
    <div class="scoreboard__header">
      <div class="header-top">
        <h2 class="scoreboard__title">Classement</h2>
        <button v-if="isOpen" class="close-btn" @click.stop="$emit('toggle')">✕</button>
      </div>
      
      <div class="scoreboard__controls" v-if="isOpen">
        <div class="scoreboard__sort">
          <button
            v-for="opt in sortOptions"
            :key="opt.key"
            class="sort-btn"
            :class="{ 'sort-btn--active': store.sortKey === opt.key }"
            @click="store.setSortKey(opt.key)"
          >
            <span class="sort-btn__icon">{{ opt.icon }}</span>
            <span class="sort-btn__label">{{ opt.label }}</span>
          </button>
        </div>

        <div class="search-wrapper">
          <input type="text" class="search-input" placeholder="Rechercher un joueur..." />
          <span class="search-icon">🔍</span>
        </div>
      </div>
    </div>

    <div class="scoreboard__body">
      <table class="scoreboard__table" v-if="displayEntries.length > 0">
        <thead v-if="isOpen">
          <tr>
            <th class="col-rank">#</th>
            <th>Joueur</th>
            <th class="col-score">
              {{ currentSortLabel }}
            </th>
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
              <!-- PIXELS VIEW -->
              <template v-if="store.sortKey === 'totalPixels'">
                <span class="score-value score-value--quaternary">
                  {{ formatNumber(entry.totalPixels) }}
                </span>
                <span class="score-value score-value--dim" v-if="isOpen"> 
                  ({{ formatPercent(entry.totalPixels) }})
                </span>
              </template>

              <template v-else-if="store.sortKey === 'moneys'">
                <span class="score-value score-value--primary">
                  {{ formatNumber(entry.moneys) }}
                </span>
              </template>

              <template v-else-if="store.sortKey === 'pixelRecord'">
                <span class="score-value score-value--active">
                  {{ formatTime(entry.pixelRecord) }}
                </span>
              </template>
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

const currentSortLabel = computed(() => {
  const opt = sortOptions.find(o => o.key === store.sortKey);
  return opt ? `${opt.icon} ${opt.label}` : '';
});
</script>

<style src="../../styles/rplace/scoreboard.css" scoped></style>
