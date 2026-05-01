import { onUnmounted, watch } from 'vue';
import { useRPlaceStore } from '../../stores/rplace';
import { storeToRefs } from 'pinia';

export function useBrushToggle() {
  const store = useRPlaceStore();
  const { isBrushActive: isActive } = storeToRefs(store);
  let intervalId: number | null = null;

  const toggle = () => {
    isActive.value = !isActive.value;
  };

  watch(isActive, (newValue) => {
    if (newValue) {
      console.log("Pinceau activé");
      intervalId = window.setInterval(() => {
        console.log("activé");
      }, 1000);
    } else {
      console.log("Pinceau désactivé");
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    }
  });

  onUnmounted(() => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  });

  return {
    isActive,
    toggle
  };
}
