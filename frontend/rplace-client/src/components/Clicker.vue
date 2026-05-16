<template>
  <div class="clicker-layout" :class="{ 'panel-closed': !isPanelOpen }">
    <CityMap />
    <div class="layout-header"></div>

    <div class="area-spawner">
      <ManualSpawner />
    </div>

    <div class="area-upgrade" :class="{ 'is-open': isPanelOpen }">
      <UpgradePanel />
      
      <button class="panel-toggle" @click="isPanelOpen = !isPanelOpen" :title="isPanelOpen ? 'Fermer' : 'Améliorations'">
        <span class="toggle-icon">{{ isPanelOpen ? '>' : '<' }}</span>
      </button>
    </div>
    
    <!--
    <div class="area-inventory">
      <InventoryBar />
    </div>
    -->
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import CityMap from './clicker/CityMap.vue';
import UpgradePanel from './clicker/UpgradePanel.vue';
import ManualSpawner from './clicker/ManualSpawner.vue';

const isPanelOpen = ref(true);
</script>

<style src="../styles/clicker/clickerLayout.css" scoped></style>
