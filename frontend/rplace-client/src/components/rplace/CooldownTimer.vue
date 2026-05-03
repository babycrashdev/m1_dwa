<template>
  <div v-if="timeLeft > 0" class="cooldown-badge">
    {{ timeLeft }}s
  </div>
</template>

<script setup lang="ts">
import { useCooldownTimer } from '../../scripts/rplace/cooldownTimer.ts';

const { timeLeft } = useCooldownTimer();
</script>

<style src="../../styles/rplace/cooldownTimer.css" scoped></style>
