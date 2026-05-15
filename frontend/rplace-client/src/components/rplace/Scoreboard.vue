<template>
  <div class="scoreboard">
    <div class="scoreboard__header">
      <h2 class="scoreboard__title">Classement</h2>
      <div class="scoreboard__sort">
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
      <table class="scoreboard__table" v-if="sorted.length > 0">
        <thead>
          <tr>
            <th class="col-rank">#</th>
            <th>Joueur</th>
            <th class="col-score">🎨</th>
            <th class="col-score">💰</th>
            <th class="col-score">⏱️</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(entry, index) in sorted"
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
                  <span v-if="entry.username === currentUsername"> (moi)</span>
                </span>
                <span class="player-country">{{ entry.country }}</span>
              </div>
            </td>

            <td class="score-cell">
              <span class="score-value score-value--quaternary"
                :class="{ 'score-value--active': store.sortKey === 'totalPixels' }">
                {{ formatNumber(entry.totalPixels) }}
              </span>
              <span class="score-value score-value--quaternary"> ({{ formatPercent(entry.totalPixels) }})</span>
            </td>

            <td class="score-cell">
              <span class="score-value score-value--primary"
                :class="{ 'score-value--active': store.sortKey === 'moneys' }">
                {{ formatNumber(entry.moneys) }}
              </span>
            </td>

            <td class="score-cell">
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
  </div>
</template>

<script setup lang="ts">
import { useScoreboardLogic } from '../../scripts/rplace/scoreboard.ts';

const {
  store,
  currentUsername,
  sortOptions,
  sorted,
  formatPercent,
  formatNumber,
  formatTime
} = useScoreboardLogic();
</script>

<style src="../../styles/rplace/scoreboard.css" scoped></style>
