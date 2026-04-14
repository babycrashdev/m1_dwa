<template>
  <div class="app-container">
    <Profile />

    <div v-if="!showAuth" class="nav-container">
      <div class="nav-controls">
        <button 
          @click="switchView(currentView === 'grid' ? 'clicker' : 'grid')" 
          class="view-toggle-btn"
          :title="currentView === 'grid' ? 'Aller au Clicker' : 'Retour à la Carte'"
        >
          <svg v-if="currentView === 'grid'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <line x1="3" y1="9" x2="21" y2="9"/>
            <line x1="3" y1="15" x2="21" y2="15"/>
            <line x1="9" y1="3" x2="9" y2="21"/>
            <line x1="15" y1="3" x2="15" y2="21"/>
          </svg>
        </button>
      </div>
    </div>

    <main class="content-wrapper">
      <div v-if="currentView === 'grid'" class="hero-section">
        <!-- <Grid /> -->
      </div>

      <div v-if="currentView === 'clicker'" class="game-section">
        <Clicker />
      </div>
    </main>

    <footer class="footer">
    </footer>
  </div>
</template>

<script setup lang="ts">
  import Profile from './components/Profile.vue';
  import Clicker from './components/Clicker.vue'
  import { useApp } from './scripts/app';
  import { useAuthStore } from './stores/auth';

  const { showAuth, currentView, switchView} = useApp();
  const authStore = useAuthStore();
</script>

<style src="./styles/main.css"></style>
