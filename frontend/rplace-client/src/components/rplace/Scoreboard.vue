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
        <!-- VUE DÉTAILLÉE DU JOUEUR -->
        <div v-if="selectedPlayer" class="player-details" key="details">
          <button class="back-btn" @click="backToList">
            <span class="back-icon">←</span> Retour
          </button>
          <div class="details-content">
            <div class="details-header">
              <h3 class="details-name">{{ selectedPlayer.username }}</h3>
              <div class="details-meta">{{ selectedPlayer.country }}</div>
              <div class="details-meta">{{ selectedPlayer.age }} ans</div>
            </div>

            <div class="details-grid">
              <div class="details-field">
                <span class="field-label">🎨 Pixels sur carte</span>
                <span class="field-value">{{ formatNumber(selectedPlayer.pixelsOnMap) }}</span>
              </div>
              <div class="details-field">
                <span class="field-label">⏱️ Âge pixel le plus vieux</span>
                <span class="field-value">{{ formatTime(selectedPlayer.pixelRecord) }}</span>
              </div>
              <div class="details-field">
                <span class="field-label">💰 Moneys possédés</span>
                <span class="field-value">{{ formatNumber(selectedPlayer.currentMoneys) }}</span>
              </div>
              <div class="details-field">
                <span class="field-label">🖱️ Nombre de clics</span>
                <span class="field-value">{{ formatNumber(selectedPlayer.totalClicks) }}</span>
              </div>
              <div class="details-field">
                <span class="field-label">🚗 Nombre de voitures produites</span>
                <span class="field-value">{{ formatNumber(selectedPlayer.totalEntitiesGenerated) }}</span>
              </div>
              <div class="details-field">
                <span class="field-label">📈 Argent gagné au total</span>
                <span class="field-value">{{ formatNumber(selectedPlayer.totalMoneyGenerated) }}</span>
              </div>
              <div class="details-field">
                <span class="field-label">💸 Argent dépensé au total</span>
                <span class="field-value">{{ formatNumber(selectedPlayer.totalMoneySpent) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- LISTE UNIFIÉE (CLASSEMENT + RECHERCHE) -->
        <div v-else key="list">
          <table class="scoreboard__table" v-if="displayEntries.length > 0">
            <thead>
              <tr>
                <th class="col-rank">#</th>
                <th>Joueur</th>
                <th class="col-score">
                  {{ store.sortKey === 'pixelsOnMap' ? 'Pixels' : (store.sortKey === 'currentMoneys' ? 'Moneys' : 'Âge pixel') }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="entry in displayEntries"
                :key="entry.username"
                :class="{ 'row--me': entry.username === currentUsername }"
                @click="selectPlayer(entry)"
              >
                <td class="rank-cell">
                  <span class="rank-number" :class="'rank-' + entry.rank">{{ entry.rank }}</span>
                </td>

                <td>
                  <span class="player-name">{{ entry.username }}</span>
                  <span class="player-country">{{ entry.country }}</span>
                </td>

                <td class="score-cell">
                  <div class="score-value" :class="{ 'flash': flashingEntries[entry.username + '-' + store.sortKey] }">
                    {{ 
                      store.sortKey === 'pixelsOnMap' 
                        ? formatNumber(entry.pixelsOnMap) 
                        : (store.sortKey === 'currentMoneys' 
                            ? formatNumber(entry.currentMoneys) 
                            : formatTime(entry.pixelRecord))
                    }}
                  </div>
                  <div v-if="store.sortKey === 'pixelsOnMap' && isOpen" class="score-value--dim">
                    ({{ formatPercent(entry.pixelsOnMap) }})
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-else-if="!store.isLoading" class="search-empty">
            {{ searchQuery ? 'Aucun joueur trouvé pour cette recherche' : 'Le classement est vide' }}
          </div>
        </div>
      </Transition>
    </div>

    <div class="scoreboard__footer" v-if="!isOpen" @click="$emit('toggle')">
      <span class="expand-hint">Cliquer pour voir tout le classement</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useScoreboardLogic } from '../../scripts/rplace/scoreboard.ts';

defineProps<{
  isOpen: boolean
}>();

defineEmits(['toggle']);

const {
  store,
  searchQuery,
  selectedPlayer,
  currentUsername,
  sortOptions,
  displayEntries,
  flashingEntries,
  selectPlayer,
  backToList,
  formatPercent,
  formatNumber,
  formatTime
} = useScoreboardLogic();
</script>

<style src="../../styles/rplace/scoreboard.css" scoped></style>
