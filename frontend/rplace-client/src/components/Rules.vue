<template>
  <div class="rules-container">

    <button class="rules-btn" @click="isOpen = true" title="Règles du jeu">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-3"/>
        <rect x="9" y="1" width="6" height="4" rx="1" ry="1"/>
        <line x1="9" y1="12" x2="15" y2="12"/>
        <line x1="9" y1="16" x2="13" y2="16"/>
      </svg>
    </button>

    <Teleport to="body">
      <Transition name="rules-fade">
        <div v-if="isOpen" class="rules-overlay" @click.self="isOpen = false">
          <div class="rules-card">
            <button class="rules-close-btn" @click="isOpen = false">&times;</button>

            <div class="rules-header">
              <span class="rules-icon">📋</span>
              <h2 class="rules-title">Règles du jeu</h2>
            </div>

            <div class="rules-tabs">
              <button
                class="rules-tab"
                :class="{ active: activeTab === 'rplace' }"
                @click="activeTab = 'rplace'"
              >
                🎨 R/Place
              </button>
              <button
                class="rules-tab"
                :class="{ active: activeTab === 'clicker' }"
                @click="activeTab = 'clicker'"
              >
                🏭 Clicker
              </button>
            </div>

            <div class="rules-body">
              <div v-if="activeTab === 'rplace'" class="rules-section">
                <div class="rules-rule">
                  <span class="rule-number">01</span>
                  <div class="rule-content">
                    <h3>Placer un pixel</h3>
                    <p>Cliquez sur n'importe quelle case du canvas pour y déposer un pixel de la couleur sélectionnée. La grille de pixels est infini, ou presque ... Chaque pixel a un coût en crédits ✨.</p>
                  </div>
                </div>
                <div class="rules-rule">
                  <span class="rule-number">02</span>
                  <div class="rule-content">
                    <h3>Cooldown</h3>
                    <p>Après avoir placé un pixel, vous devez attendre une seconde avant de pouvoir en placer un nouveau. Attention, le prix d'un pixel augmente après avoir été acheté !</p>
                  </div>
                </div>
                <div class="rules-rule">
                  <span class="rule-number">03</span>
                  <div class="rule-content">
                    <h3>Couleurs</h3>
                    <p>Certaines couleurs sont verrouillées par défaut. Achetez-les avec vos crédits pour enrichir votre palette.</p>
                  </div>
                </div>
                <div class="rules-rule">
                  <span class="rule-number">04</span>
                  <div class="rule-content">
                    <h3>Pinceau</h3>
                    <p>Débloquez le mode pinceau pour placer plusieurs pixels à la fois. Différentes tailles sont disponibles à l'achat.</p>
                  </div>
                </div>
                <div class="rules-rule">
                  <span class="rule-number">05</span>
                  <div class="rule-content">
                    <h3>Respect</h3>
                    <p>Le canvas est collaboratif. Respectez les créations des autres joueurs — ou pas. C'est la guerre des pixels !</p>
                  </div>
                </div>
              </div>

              <div v-if="activeTab === 'clicker'" class="rules-section">
                <div class="rules-rule">
                  <span class="rule-number">01</span>
                  <div class="rule-content">
                    <h3>Cliquer pour produire</h3>
                    <p>Appuyez sur le bouton 🏭 pour ajouter des colis à la file. Un drone les livrera automatiquement toutes les 10 secondes. Les drones ramassent les colis et les ramène à l'entrepôt.</p>
                  </div>
                </div>
                <div class="rules-rule">
                  <span class="rule-number">02</span>
                  <div class="rule-content">
                    <h3>Ouvriers</h3>
                    <p>Achetez des ouvriers pour qu'il génèrent des drones automatiquement.</p>
                  </div>
                </div>
                <div class="rules-rule">
                  <span class="rule-number">03</span>
                  <div class="rule-content">
                    <h3>Bâtiments</h3>
                    <p>Débloquez des bâtiments pour générer des bonus appliqués au drone qui ramassent leurs colis ! Placez vos batiments sur la carte une fois débloqués pour qu'ils génèrent des colis. Chaque type de bâtiment a ses propres avantages.</p>
                  </div>
                </div>
                <div class="rules-rule">
                  <span class="rule-number">04</span>
                  <div class="rule-content">
                    <h3>Boost</h3>
                    <p>Activez le boost sur vos bâtiments pour accélérer temporairement leur production. Un cooldown s'applique entre chaque activation. Vous pouvez choisir entre booster soit un bâtiment, soit tous les bâtiments identiques ou encore tous les bâtiments.</p>
                  </div>
                </div>
                <div class="rules-rule">
                  <span class="rule-number">05</span>
                  <div class="rule-content">
                    <h3>Améliorations</h3>
                    <p>Investissez vos crédits dans des améliorations de vitesse et de production pour maximiser vos gains à long terme.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  defaultTab?: 'rplace' | 'clicker';
}>();

const isOpen = ref(false);
const activeTab = ref<'rplace' | 'clicker'>(props.defaultTab ?? 'rplace');
</script>

<style src="../styles/rules.css" scoped></style>
