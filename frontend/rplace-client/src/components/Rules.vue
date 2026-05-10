<template>
  <div class="rules-container">
    <button class="rules-btn" @click="isOpen = true" title="Règles du jeu">
      📋
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
                    <p>Cliquez sur n'importe quelle case du canvas pour y déposer un pixel de la couleur sélectionnée. Chaque pixel a un coût en crédits ✨.</p>
                  </div>
                </div>
                <div class="rules-rule">
                  <span class="rule-number">02</span>
                  <div class="rule-content">
                    <h3>Cooldown</h3>
                    <p>Après avoir placé un pixel, vous devez attendre quelques secondes avant de pouvoir en placer un nouveau.</p>
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
                    <p>Appuyez sur le bouton 🏭 pour ajouter des voitures à la file. Un drone les livrera automatiquement toutes les 10 secondes.</p>
                  </div>
                </div>
                <div class="rules-rule">
                  <span class="rule-number">02</span>
                  <div class="rule-content">
                    <h3>Ouvriers</h3>
                    <p>Achetez des ouvriers pour automatiser la production. Plus vous en avez, plus votre usine tourne vite sans intervention.</p>
                  </div>
                </div>
                <div class="rules-rule">
                  <span class="rule-number">03</span>
                  <div class="rule-content">
                    <h3>Bâtiments</h3>
                    <p>Placez des bâtiments sur la carte pour générer des bonus de valeur sur chaque livraison. Chaque type de bâtiment a ses propres avantages.</p>
                  </div>
                </div>
                <div class="rules-rule">
                  <span class="rule-number">04</span>
                  <div class="rule-content">
                    <h3>Boost</h3>
                    <p>Activez le boost sur vos bâtiments pour accélérer temporairement leur production. Un cooldown s'applique entre chaque activation.</p>
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
