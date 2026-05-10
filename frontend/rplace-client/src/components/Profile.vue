<template>
  <div class="user-profile-card" @click="toggleAuth">
    <div class="avatar-mini">
      {{ authStore.isAuthenticated ? authStore.user?.username?.charAt(0).toUpperCase() : '?' }}
    </div>
    <div class="user-info-text">
      <span class="user-name">
        {{ authStore.isAuthenticated ? authStore.user?.username : 'Invité' }}
      </span>
      <span class="user-context-info" v-if="authStore.isAuthenticated">
        {{ currentView === 'grid' ? authStore.user?.country : authStore.user?.age + ' ans' }}
      </span>
      <span class="user-context-info" v-else>Connexion</span>
      <span class="user-pixels" v-if="currentView === 'clicker'">
        ✨ {{ formatNumber(gameStore.money) }}
      </span>
    </div>
  </div>

  <Register v-if="showAuth" @close="showAuth = false" />
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth';
import { useApp } from '../scripts/app';
import { useGameStore } from '../stores/clicker/game';
import { formatNumber } from '../scripts/formatNumber';
import Register from './Register.vue';

const authStore = useAuthStore();
const gameStore = useGameStore();
const { showAuth, toggleAuth, currentView } = useApp();
</script>

<style src="../styles/profile.css" scoped></style>
