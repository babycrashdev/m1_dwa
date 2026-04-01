<template>
  <div class="app-container">
    <header class="nav-bar">
      <div class="logo">
        <span class="logo-pixel"></span>
      </div>
      <button @click="showAuth = !showAuth" class="auth-toggle-btn">
        {{ authStore.isAuthenticated ? (showAuth ? 'Accueil' : authStore.user?.username) : (showAuth ? 'Accueil' : 'Se Connecter') }}
      </button>
    </header>

    <main class="content-wrapper">
      <div v-if="!showAuth" class="hero-section">
        <h1>Grille</h1>
      </div>

      <div v-else class="auth-section">
        <Register @close="showAuth = false" />
      </div>
    </main>

    <footer class="footer">
    </footer>
  </div>
</template>

<script setup lang="ts">
  import Register from './components/Register.vue'
  import { useApp } from './scripts/app';
  import { useAuthStore } from './stores/auth';

  const { showAuth } = useApp();
  const authStore = useAuthStore();
</script>

<style src="./styles/main.css"></style>
