<template>
  <div class="app-container">
    <LoadingScreen />
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
        <RPlace />
      </div>

      <div v-if="currentView === 'clicker'" class="game-section">
        <Clicker />
      </div>
  </main>



    <div v-if="currentView === 'grid' && !showAuth && authStore.isAuthenticated" class="rplace-controls">
      <!-- Infos Pixel à GAUCHE -->
      <InfoPixel />

      <div class="main-actions">
        <div class="tools-row">
          <button class="tool-btn-placeholder" title="Futur outil"></button>
          <button class="tool-btn-placeholder" title="Futur outil"></button>
          <BrushToggle />
        </div>
        <ColorPalette />
      </div>

      <BrushPanel />
    </div>

    <footer class="footer">
    </footer>
  </div>
</template>

<script setup lang="ts">
  import Register from './components/Register.vue';
  import RPlace from './components/RPlace.vue';
  import Profile from './components/Profile.vue';
  import Clicker from './components/Clicker.vue';
  import LoadingScreen from './components/common/LoadingScreen.vue';
  import BrushToggle from './components/rplace/BrushToggle.vue';
  import ColorPalette from './components/rplace/ColorPalette.vue';
  import BrushPanel from './components/rplace/BrushPanel.vue';
  import InfoPixel from './components/rplace/InfoPixel.vue';
  import { useApp } from './scripts/app';
  import { useAuthStore } from './stores/auth';
  import { useRPlaceStore } from './stores/rplace';

  const { showAuth, currentView, switchView} = useApp();
  const authStore = useAuthStore();
  const rplaceStore = useRPlaceStore();

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });
  };
</script>

<style src="./styles/main.css"></style>
<style src="./styles/rplace/colorPanel.css" scoped></style>

