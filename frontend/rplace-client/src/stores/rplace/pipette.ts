import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRPlaceStore } from '../rplace';

export const usePipetteStore = defineStore('pipette', () => {
  const rplaceStore = useRPlaceStore();

  const isActive = ref(false);
  const previousColor = ref('');

  function toggle() {
    isActive.value = !isActive.value;
  }

  function startPicking() {
    previousColor.value = rplaceStore.selectedColor;
    isActive.value = true;
  }

  async function pickColor(color: string) {
    const colorUpper = color.toUpperCase();

    const freeColors = [
      '#FF4500', '#FFA800', '#FFD635', '#00A368',
      '#3690EA', '#FFFFFF', '#811E9F', '#000000'
    ];

    if (freeColors.includes(colorUpper) || rplaceStore.ownedColors.includes(colorUpper)) {
      rplaceStore.selectedColor = colorUpper;
      isActive.value = false;
    } else {
      rplaceStore.openBuyModal(colorUpper);
    }
  }

  return {
    isActive,
    toggle,
    startPicking,
    pickColor
  };
});
