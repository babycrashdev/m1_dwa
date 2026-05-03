<template>
  <div class="auth-container">
    <div class="auth-card">
      <button class="close-btn" @click="$emit('close')">&times;</button>
      
      <div class="auth-form">
        <h2>Couleur Verrouillée</h2>
        
        <div class="unlock-content">
          <div class="color-preview-large" :style="{ backgroundColor: color }">
            <span class="lock-icon">🔒</span>
          </div>
          
          <p class="unlock-desc">
            Cette couleur est actuellement verrouillée. 
            Voulez-vous la débloquer pour l'utiliser ?
          </p>

          <div class="unlock-details">
            <div class="price-badge">
              <span class="price-value">1 000</span>
              <span class="price-unit">Pixels</span>
            </div>
          </div>

          <button class="submit-btn confirm-btn" @click="$emit('unlock')">
            Débloquer la couleur
          </button>
          
          <button @click="$emit('close')" class="cancel-btn">
            Plus tard
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="../../scripts/rplace/ColorUnlockModal.ts"></script>

<style scoped src="../../styles/rplace/ColorUnlockModal.css"></style>

<!--Inutile mais a confirmer avec lukas-->
<style scoped src="../../styles/auth.css"></style>
