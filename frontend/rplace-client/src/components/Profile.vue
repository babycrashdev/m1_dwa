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
    </div>
  </div>

  <Register v-if="showAuth" @close="showAuth = false" />
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth';
import { useApp } from '../scripts/app';
import Register from './Register.vue';

const authStore = useAuthStore();
const { showAuth, toggleAuth, currentView } = useApp();
</script>

<style src="../styles/profile.css" scoped></style>
