<template>
  <div class="scoreboard" :class="{ 'scoreboard--mini': !isOpen }">
    <div class="scoreboard__header">
      <div class="header-top">
        <Transition name="fade-fast">
          <h2 class="scoreboard__title" v-if="!selectedPlayer">Classement</h2>
        </Transition>
        <Transition name="fade-fast">
          <button v-if="isOpen && !selectedPlayer" class="close-btn" @click.stop="$emit('toggle')">✕</button>
        </Transition>
      </div>
      
      <Transition name="slide-up-fast">
        <div class="scoreboard__controls" v-if="isOpen && !selectedPlayer">
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
            <input 
              type="text" 
              class="search-input" 
              placeholder="Rechercher..." 
              v-model="searchQuery"
            />
            <span class="search-icon">🔍</span>
          </div>
        </div>
      </Transition>
    </div>

    <div class="scoreboard__body">
      <Transition name="fade-fast" mode="out-in">
        <!-- PLAYER DETAIL VIEW -->
        <div v-if="selectedPlayer" class="player-details" key="details">
          <button class="back-btn" @click="backToList">
            <span class="back-icon">←</span> Retour
          </button>
          
          <div class="details-content">
            <div class="details-header">
              <h3 class="details-name">{{ selectedPlayer.username }}</h3>
              <div class="details-meta">{{ selectedPlayer.country }}</div>
              <div class="details-meta">
                {{ (selectedPlayer.age !== undefined && selectedPlayer.age !== null) ? selectedPlayer.age : '?' }} ans
              </div>
            </div>

            <div class="details-grid">
              <!-- Back to blank placeholders as requested -->
              <div v-for="i in 5" :key="i" class="details-field">
                <span class="field-label">Info {{ i }}</span>
                <span class="field-value">xxxxxxxxxxxxxx</span>
              </div>
            </div>
          </div>
        </div>

        <!-- LIST VIEWS -->
        <div v-else key="list">
          <!-- SEARCH RESULTS VIEW -->
          <Transition name="fade-fast" mode="out-in">
            <table class="scoreboard__table" v-if="searchQuery" key="search">
              <tbody>
                <tr
                  v-for="entry in filteredEntries"
                  :key="'search-' + entry.username"
                  :class="{ 'row--me': entry.username === currentUsername }"
                  @click="selectPlayer(entry)"
                >
                  <td class="player-cell-only">
                    <div class="player-cell">
                      <span class="player-name" :class="{ 'player-name--me': entry.username === currentUsername }">
                        {{ entry.username }}
                        <span v-if="entry.username === currentUsername && isOpen" class="me-tag"> (moi)</span>
                      </span>
                      <span class="player-country" v-if="isOpen">{{ entry.country }}</span>
                    </div>
                  </td>
                </tr>
                <tr v-if="filteredEntries.length === 0">
                  <td class="search-empty">Aucun résultat</td>
                </tr>
              </tbody>
            </table>

            <!-- NORMAL RANKING VIEW -->
            <table class="scoreboard__table" v-else-if="displayEntries.length > 0" key="ranking">
              <thead>
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
                  @click="selectPlayer(entry)"
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
                        <span v-if="entry.username === currentUsername && isOpen" class="me-tag"> (moi)</span>
                      </span>
                      <span class="player-country" v-if="isOpen">{{ entry.country }}</span>
                    </div>
                  </td>

                  <td class="score-cell">
                    <div v-if="store.sortKey === 'totalPixels'">
                      <span class="score-value">
                        {{ formatNumber(entry.totalPixels) }}
                      </span>
                      <span class="score-value score-value--dim" v-if="isOpen"> 
                        ({{ formatPercent(entry.totalPixels) }})
                      </span>
                    </div>

                    <div v-else-if="store.sortKey === 'moneys'">
                      <span class="score-value">
                        {{ formatNumber(entry.moneys) }}
                      </span>
                    </div>

                    <div v-else-if="store.sortKey === 'pixelRecord'">
                      <span class="score-value score-value--active">
                        {{ formatTime(entry.pixelRecord) }}
                      </span>
                    </div>
                  </td>

                </tr>
              </tbody>
            </table>

            <!-- EMPTY STATE -->
            <div class="scoreboard__empty" v-else-if="!store.isLoading" key="empty">
              Aucun joueur trouvé.
            </div>
          </Transition>
        </div>
      </Transition>
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
  searchQuery,
  selectedPlayer,
  currentUsername,
  sortOptions,
  sorted,
  filteredEntries,
  selectPlayer,
  backToList,
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
