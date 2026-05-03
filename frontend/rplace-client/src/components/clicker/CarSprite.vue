<!-- Generer par IA -->

<template>
  <g :style="spriteStyle">
    <image 
      :href="droneImg" 
      x="-30" 
      y="-30" 
      width="60" 
      height="60" 
    />
    
    
    <g v-if="delivery.weight > 1" transform="translate(20, -20)">
      <circle r="12" fill="#ff4757" />
      <text 
        text-anchor="middle" 
        dy="4" 
        fill="white" 
        font-size="10" 
        font-weight="bold"
      >
        x{{ delivery.weight }}
      </text>
    </g>
  </g>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { CITY_SVG_PATH, SLOT_PATH_PROGRESS } from '../../scripts/clicker/mapConfig';
import { useMapStore } from '../../stores/clicker/mapStore';
import { useUpgradeStore } from '../../stores/clicker/upgradeStore';
import { useGameStore } from '../../stores/clicker/game';
import { useDeliveryStore } from '../../stores/clicker/deliveryStore';
import droneImg from '../../assets/drone.png';

const props = defineProps<{
  delivery: {
    id: number;
    weight: number;
    startTime: number;
  }
}>();

const mapStore = useMapStore();
const upgradeStore = useUpgradeStore();
const gameStore = useGameStore();
const deliveryStore = useDeliveryStore();

const DURATION_MS = 10000;
const offsetDistance = ref('0%');
const collectedSlots = new Set<number>();

onMounted(() => {
  const animate = () => {
    const elapsed = Date.now() - props.delivery.startTime;
    const progress = Math.min((elapsed / DURATION_MS) * 100, 100);
    offsetDistance.value = `${progress}%`;

    mapStore.slots.forEach(slot => {
        if (slot.parcelPresent && !collectedSlots.has(slot.slotIndex)) {
            const slotPos = SLOT_PATH_PROGRESS[slot.slotIndex];
            if (slotPos !== undefined && progress >= slotPos && progress <= slotPos + 2) {
                collectedSlots.add(slot.slotIndex);
                mapStore.collectParcel(slot.slotIndex);
                
                if (slot.buildingType) {
                    const upg = upgradeStore.config?.upgrades[slot.buildingType];
                    if (upg) {
                        deliveryStore.addParcelToDelivery(props.delivery.id, upg.bonusValueBonus || 0);
                    }
                }
            }
        }
    });

    if (progress < 100) {
      requestAnimationFrame(animate);
    }
  };
  animate();
});

const spriteStyle = computed(() => ({
  offsetPath: `path('${CITY_SVG_PATH}')`,
  offsetDistance: offsetDistance.value,
  offsetRotate: '0deg'
}));
</script>
