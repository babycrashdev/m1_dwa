<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-tabs">
        <button :class="{ active: mode === 'login' }" @click="mode = 'login'">Connexion</button>
        <button :class="{ active: mode === 'register' }" @click="mode = 'register'">Inscription</button>
      </div>

      <div class="auth-form">
        <p v-if="message" :class="['message', messageType]">{{ message }}</p>

        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="username">Pseudo</label>
            <input id="username" v-model="user.username" type="text" placeholder="Votre pseudo" required />
          </div>

          <div class="form-group">
            <label for="password">Mot de passe</label>
            <input id="password" v-model="user.password" type="password" placeholder="••••••••" required />
          </div>

          <template v-if="mode === 'register'">
            <div class="form-row">
              <div class="form-group">
                <label for="age">Âge</label>
                <input id="age" v-model.number="user.age" type="number" placeholder="Ex: 25" required />
              </div>

              <div class="form-group">
                <label for="country">Pays</label>
                <select id="country" v-model="user.country" required>
                  <option value="" disabled selected>Choisir...</option>
                  <option value="France">France</option>
                  <option value="Belgique">Belgique</option>
                  <option value="Suisse">Suisse</option>
                  <option value="Canada">Canada</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
            </div>
          </template>

          <button type="submit" class="submit-btn" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            {{ mode === 'login' ? 'Se connecter' : 'Créer un compte' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '../scripts/auth';
const { mode, loading, message, messageType, user, handleSubmit } = useAuth();
</script>

<style src="../styles/auth.css" scoped></style>
