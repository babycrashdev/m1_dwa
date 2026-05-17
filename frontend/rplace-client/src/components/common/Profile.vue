<template>
  <div class="profile-card-mini" :class="{ 'profile-card-mini--clicker': currentView === 'clicker' }" @click="toggleAuth">
    <div class="profile-card-mini__header">
      <div class="profile-card-mini__avatar">
        <div class="avatar-circle">
          {{ initials }}
        </div>
        <div class="rank-badge" v-if="authStore.isAuthenticated && rank">
          #{{ rank }}
        </div>
      </div>

      <div class="user-header">
        <span class="username">{{ profileData.username }}</span>
        <span class="country" v-if="authStore.isAuthenticated">{{ profileData.country }}</span>
      </div>
    </div>

    <div class="profile-card-mini__body">
      <div class="stats-row" v-if="currentView === 'grid' && authStore.isAuthenticated">
        <div class="stat stat--money">
          <span class="stat-value">✨ {{ formatNumber(profileData.moneys || 0) }}</span>
        </div>
        <div class="stat stat--pixels">
          <span class="stat-value">🎨 {{ formatNumber(profileData.totalPixels || 0) }}</span>
        </div>
        <div class="stat stat--domination">
          <span class="stat-value">🌍 {{ domination }}</span>
        </div>
      </div>

      <div class="stats-row" v-else-if="currentView === 'clicker' && authStore.isAuthenticated">
        <div class="stat stat--money">

          <span class="stat-value">✨ {{ formatNumber(profileData.moneys || 0) }}</span>
        </div>
        <div class="stat stat--income">
          <span class="stat-value">👷 {{ formatNumber(profileData.passiveIncome || 0) }} 📦/s</span>
        </div>
        <div class="stat stat--bonus">
          <span class="stat-value">🏭 {{ formatNumber(profileData.clickBonus || 1) }} ✨/📦</span>
        </div>
      </div>
    </div>
  </div>

  <Register v-if="showAuth" @close="toggleAuth" />
</template>

<script setup lang="ts">
import { useProfileLogic } from '../../scripts/common/profileLogic';
import Register from '../Register.vue';

const {
  authStore,
  currentView,
  profileData,
  rank,
  domination,
  initials,
  toggleAuth,
  showAuth,
  formatNumber,
} = useProfileLogic();
</script>

<style src="../../styles/common/profile.css" scoped></style>
