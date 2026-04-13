<!--Todo: changer le deconnexion pour passer par le deconnexion de register-->
<template>
  <div class="profile-overlay" @click.self="$emit('close')">
    <div class="profile-card">
      <div class="profile-header">
        <div class="avatar-large">
          {{ user?.username?.charAt(0).toUpperCase() }}
        </div>
        <h2>{{ user?.username }}</h2>
      </div>

      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">Âge</span>
          <span class="info-value">{{ user?.age || 'Non spécifié' }} ans</span>
        </div>
        <div class="info-item">
          <span class="info-label">Pays</span>
          <span class="info-value">{{ user?.country || 'Inconnu' }}</span>
        </div>
      </div>

      <button @click="handleLogout(() => $emit('close'))" class="logout-btn">
        Se déconnecter
      </button>

      <button @click="$emit('close')" class="close-profile">
        Fermer
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProfile } from '../scripts/profile';
const { user, handleLogout } = useProfile();
const emit = defineEmits(['close']);
</script>

<style src="../styles/profile.css" scoped></style>
