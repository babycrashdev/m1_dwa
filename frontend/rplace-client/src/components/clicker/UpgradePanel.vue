<!-- Temporaire -->
<template>
  <div class="upgrade-panel">
    <div class="resource-header">
      <h3>RESOURCES</h3>
      <div class="resource-item">
        <span class="label">PIXELS</span>
        <span class="value">1,240</span>
      </div>
      <div class="resource-item">
        <span class="label">REVENU</span>
        <span class="value">+12 /s</span>
      </div>
    </div>

    <div class="upgrade-list">
      <div v-for="i in 4" :key="i" class="upgrade-card">
        <div class="upgrade-icon"></div>
        <div class="upgrade-info">
          <span class="name">Upgrade {{ i }}</span>
          <span class="cost">500 px</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style src="../../styles/clicker/upgradePanel.css" scoped></style>
