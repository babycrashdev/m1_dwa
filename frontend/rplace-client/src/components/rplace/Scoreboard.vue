<template>
  <div class="scoreboard">
    <!-- Header -->
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

    <!-- Status -->
    <div class="scoreboard__status">
      <span class="status__updated" v-if="store.lastUpdated">
        Mis à jour {{ formattedTime }}
      </span>
      <span v-else>—</span>
      <span class="status__loading" v-if="store.isLoading">
        <span class="loading-dot"></span> Chargement…
      </span>
    </div>

    <!-- Table -->
    <div class="scoreboard__body">
      <table class="scoreboard__table" v-if="sorted.length > 0">
        <thead>
          <tr>
            <th class="col-rank">#</th>
            <th>Joueur</th>
            <th class="col-score">💰 Crédits</th>
            <th class="col-score">⬆️ Niveaux</th>
            <th class="col-score">🏠 Slots</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(entry, index) in sorted"
            :key="entry.username"
            :class="{ 'row--me': entry.username === currentUsername }"
          >
            <!-- Rank -->
            <td class="rank-cell">
              <span class="rank-medal" v-if="index === 0">🥇</span>
              <span class="rank-medal" v-else-if="index === 1">🥈</span>
              <span class="rank-medal" v-else-if="index === 2">🥉</span>
              <span class="rank-number" v-else>{{ index + 1 }}</span>
            </td>

            <!-- Player -->
            <td>
              <div class="player-cell">
                <span class="player-name" :class="{ 'player-name--me': entry.username === currentUsername }">
                  {{ entry.username }}
                  <span v-if="entry.username === currentUsername"> (moi)</span>
                </span>
                <span class="player-country">{{ entry.country }}</span>
              </div>
            </td>

            <!-- Moneys -->
            <td class="score-cell">
              <span
                class="score-value score-value--primary"
                :class="{ 'score-value--active': store.sortKey === 'moneys' }"
              >
                {{ formatNumber(entry.moneys) }}
              </span>
            </td>

            <!-- Upgrade levels -->
            <td class="score-cell">
              <span
                class="score-value score-value--secondary"
                :class="{ 'score-value--active': store.sortKey === 'totalUpgradeLevels' }"
              >
                {{ entry.totalUpgradeLevels }}
              </span>
            </td>

            <!-- Slots -->
            <td class="score-cell">
              <span
                class="score-value score-value--tertiary"
                :class="{ 'score-value--active': store.sortKey === 'unlockedSlots' }"
              >
                {{ entry.unlockedSlots }}
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
import { computed, onMounted, onUnmounted } from 'vue';
import { useScoreboardStore, type SortKey } from '../../stores/scoreboard';
import { useAuthStore } from '../../stores/auth';

const store = useScoreboardStore();
const authStore = useAuthStore();

const currentUsername = computed(() => authStore.user?.username ?? '');

const sortOptions: { key: SortKey; label: string; icon: string }[] = [
  { key: 'moneys',            label: 'Crédits',  icon: '💰' },
  { key: 'totalUpgradeLevels', label: 'Niveaux',  icon: '⬆️' },
  { key: 'unlockedSlots',     label: 'Slots',    icon: '🏠' },
];

const sorted = computed(() => store.getSortedEntries());

const formattedTime = computed(() => {
  if (!store.lastUpdated) return '';
  return store.lastUpdated.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
});

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'k';
  return n.toString();
}

onMounted(() => store.startPolling());
onUnmounted(() => store.stopPolling());
</script>

<style src="../../styles/rplace/scoreboard.css" scoped></style>
