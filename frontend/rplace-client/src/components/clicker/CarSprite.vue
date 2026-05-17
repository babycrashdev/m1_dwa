<!-- Utilisation en partie de l'IA -->
<template>
  <g>
    <g 
      v-for="(parcel, i) in collectedParcels" 
      :key="'follow-' + parcel.slotIndex"
      :style="getParcelStyle(i)"
    >
      <image 
        :href="colisImg" 
        x="-15" 
        y="-15" 
        width="30" 
        height="30" 
      />
    </g>

    <g :style="spriteStyle">
    <g :style="droneTransformStyle">
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
        x{{ formatNumber(delivery.weight) }}
      </text>
    </g>
    </g>
  </g>
</g>
</template>

<script setup lang="ts">
import { useCarSprite } from '../../scripts/clicker/carSprite';
import droneImg from '../../assets/drone.png';
import colisImg from '../../assets/colis.png';

const props = defineProps<{
  delivery: {
    id: number;
    weight: number;
    startTime: number;
  }
}>();

const {
  droneScale,
  collectedParcels,
  spriteStyle,
  droneTransformStyle,
  getParcelStyle,
  formatNumber
} = useCarSprite(props.delivery);
</script>
