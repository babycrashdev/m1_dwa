<!-- Utilisation en partie de l'IA nottament pour les svg -->
<template>
  <div class="auth-container">
    <div class="auth-card">
      <button class="close-btn" @click="$emit('close')">&times;</button>
      
      <div class="auth-form">
        <h2>{{ mode === 'logout' ? 'Session' : (mode === 'login' ? 'Connexion' : 'Inscription') }}</h2>
        
        <p v-if="message" :class="['message', messageType]">{{ message }}</p>

        <!-- Connecté -->
        <div v-if="mode === 'logout'" class="logout-section">
          <div class="user-info">
            <div class="user-avatar">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
            <p class="welcome-text">Connecté en tant que</p>
            <p class="username-display">{{ authStore.user?.username }}</p>
          </div>
          <div class="profile-details-form">
            <div class="form-group">
              <div class="input-wrapper">
                <input 
                  type="password" 
                  v-model="user.password" 
                  placeholder="Nouveau mot de passe" 
                  @focus="user.password === '********' && (user.password = '')" 
                />
                <span class="input-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </span>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <div class="input-wrapper">
                  <input type="number" v-model.number="user.age" placeholder="Âge" />
                  <span class="input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  </span>
                </div>
              </div>

              <div class="form-group">
                <div class="input-wrapper">
                  <input type="text" v-model="user.country" placeholder="Pays" />
                  <span class="input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  </span>
                </div>
              </div>
            </div>

            <button @click="handleUpdate(() => $emit('close'))" class="submit-btn confirm-btn" :disabled="loading">
              <span v-if="loading" class="spinner"></span>
              Confirmer les changements
            </button>
          </div>
          
          <div class="logout-actions">
            <button @click="handleLogout(() => $emit('close'))" class="submit-btn">
              Se déconnecter
            </button>
            <button @click="$emit('close')" class="cancel-btn">
              Retour au jeu
            </button>
          </div>
        </div>

        <!-- Déconnecté -->
        <form v-else @submit.prevent="handleSubmit(() => $emit('close'))">
          <div class="form-group">
            <div class="input-wrapper">
              <input 
                id="username" 
                v-model="user.username" 
                type="text" 
                placeholder="Nom d'utilisateur" 
                required 
              />
              <span class="input-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </span>
            </div>
          </div>

          <div class="form-group">
            <div class="input-wrapper">
              <input 
                id="password" 
                v-model="user.password" 
                type="password" 
                placeholder="Mot de passe" 
                required 
              />
              <span class="input-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </span>
            </div>
          </div>

          <div v-if="mode === 'login'" class="form-options">
            <label class="remember-me">
              <input type="checkbox" v-model="user.rememberMe" />
              <span class="checkmark"></span>
              Se souvenir de moi
            </label>
            <a href="#" class="forgot-password" @click.prevent="">Mot de passe oublié ?</a>
          </div>

          <template v-if="mode === 'register'">
            <div class="form-row">
              <div class="form-group">
                <div class="input-wrapper">
                  <input 
                    id="age" 
                    v-model.number="user.age" 
                    type="number" 
                    placeholder="Âge" 
                    maxlength="3"
                    min="1" 
                    max="120"
                    required 
                  />
                  <span class="input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  </span>
                </div>
              </div>

              <div class="form-group">
                <div class="input-wrapper">
                  <input id="country" v-model="user.country" type="text" placeholder="Pays" required />
                  <span class="input-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  </span>
                </div>
              </div>
            </div>
          </template>

          <button type="submit" class="submit-btn" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            {{ mode === 'login' ? 'Se connecter' : "S'inscrire" }}
          </button>

          <div class="mode-toggle">
            <template v-if="mode === 'login'">
              Pas encore de compte ? <button type="button" @click="mode = 'register'">S'inscrire</button>
            </template>
            <template v-else>
              Déjà un compte ? <button type="button" @click="mode = 'login'">Se connecter</button>
            </template>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuth } from '../scripts/auth';

const { mode, loading, message, messageType, user, handleSubmit, handleLogout, authStore, fetchProfile, handleUpdate } = useAuth();
const emit = defineEmits(['close']);

onMounted(() => {
  if (authStore.isAuthenticated) {
    mode.value = 'logout';
    fetchProfile();
  }
});
</script>

<style src="../styles/auth.css" scoped></style>
