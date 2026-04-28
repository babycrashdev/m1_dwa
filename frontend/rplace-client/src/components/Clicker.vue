<template>
  <div class="clicker-layout">
    <CityMap />
    <div class="layout-header"></div>

    <div class="area-spawner">
      <ManualSpawner />
    </div>


    <!-- 
    <div class="area-upgrade">
      <UpgradePanel />
    </div>

    <div class="area-inventory">
      <InventoryBar />
    </div>
    -->
  </div>
</template>

<script setup lang="ts">
import CityMap from './clicker/CityMap.vue';
import UpgradePanel from './clicker/UpgradePanel.vue';
import ManualSpawner from './clicker/ManualSpawner.vue';
import InventoryBar from './clicker/InventoryBar.vue';
</script>

<style src="../styles/clicker/clickerLayout.css" scoped></style>
