<template>
  <div class="scoreboard">
    <div class="scoreboard__header">
      <div class="header-top">
        <h2 class="scoreboard__title">🏆 CLASSEMENT</h2>
        <button class="close-btn" @click="emit('close')" title="Fermer">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="header-controls">
        <div class="scoreboard__sort">
          <button
            v-for="opt in sortOptions"
            :key="opt.key"
            class="sort-icon-btn"
            :class="{ 'sort-icon-btn--active': store.sortKey === opt.key }"
            @click="store.setSortKey(opt.key)"
            :title="opt.label"
          >
            {{ opt.icon }}
          </button>
        </div>

        <div class="scoreboard__search">
          <div class="search-wrapper">
            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Rechercher un joueur..."
              class="search-input"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="scoreboard__body">
      <table class="scoreboard__table" v-if="displayEntries.length > 0">
        <thead>
          <tr>
            <th class="col-rank">#</th>
            <th>JOUEUR</th>
            <th class="col-score">
               <span v-if="store.sortKey === 'totalPixels'">PIXELS</span>
               <span v-else-if="store.sortKey === 'moneys'">CRÉDITS</span>
               <span v-else-if="store.sortKey === 'pixelRecord'">RECORD</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="entry in displayEntries"
            :key="entry.username"
            :class="{ 'row--me': entry.username === currentUsername }"
          >
            <td class="rank-cell">
              <span class="rank-medal" v-if="entry.originalRank === 1">🥇</span>
              <span class="rank-medal" v-else-if="entry.originalRank === 2">🥈</span>
              <span class="rank-medal" v-else-if="entry.originalRank === 3">🥉</span>
              <span class="rank-number" v-else>{{ entry.originalRank }}</span>
            </td>

            <td>
              <div class="player-cell">
                <span class="player-name" :class="{ 'player-name--me': entry.username === currentUsername }">
                  {{ entry.username }}
                  <span v-if="entry.username === currentUsername"> (moi)</span>
                </span>
                <span class="country-tag">{{ entry.country }}</span>
              </div>
            </td>

            <td class="score-cell">
              <template v-if="store.sortKey === 'totalPixels'">
                <span class="score-value">{{ formatNumber(entry.totalPixels) }}</span>
                <span class="score-percent"> ({{ formatPercent(entry.totalPixels) }})</span>
              </template>
              <template v-else-if="store.sortKey === 'moneys'">
                <span class="score-value">{{ formatNumber(entry.moneys) }} 💰</span>
              </template>
              <template v-else-if="store.sortKey === 'pixelRecord'">
                <span class="score-value">{{ formatTime(entry.pixelRecord) }}</span>
              </template>
            </td>

          </tr>
        </tbody>
      </table>

      <div class="scoreboard__empty" v-else-if="!store.isLoading">
        <template v-if="searchQuery">
          Aucun joueur ne correspond à votre recherche.
        </template>
        <template v-else>
          Aucun joueur trouvé.
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useScoreboardLogic } from '../../scripts/rplace/scoreboard.ts';

const emit = defineEmits(['close']);

const {
  store,
  currentUsername,
  sortOptions,
  displayEntries,
  searchQuery,
  formatPercent,
  formatNumber,
  formatTime
} = useScoreboardLogic();
</script>

<style src="../../styles/rplace/scoreboard.css" scoped></style>
