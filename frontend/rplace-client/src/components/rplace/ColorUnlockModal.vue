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

<script setup lang="ts">
defineProps<{
  color: string;
}>();

defineEmits(['close', 'unlock']);
</script>

<style scoped>
.unlock-content {
  text-align: center;
  padding-top: 10px;
}

.color-preview-large {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  margin: 0 auto 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  border: 3px solid rgba(255, 255, 255, 0.2);
}

.lock-icon {
  font-size: 32px;
  filter: grayscale(100%);
}

.unlock-desc {
  color: rgba(255, 255, 255, 0.7);
  font-size: 15px;
  line-height: 1.5;
  margin-bottom: 25px;
  padding: 0 10px;
}

.unlock-details {
  margin-bottom: 30px;
}

.price-badge {
  display: inline-flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.1);
  padding: 12px 25px;
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.price-value {
  font-size: 24px;
  font-weight: 700;
  color: #fbbf24;
}

.price-unit {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.6;
}

.confirm-btn {
  background-color: #fbbf24 !important;
  color: #1e1e1e !important;
  margin-bottom: 12px;
}

.confirm-btn:hover {
  background-color: #f59e0b !important;
}
</style>


<style src="../../styles/auth.css" scoped></style>
