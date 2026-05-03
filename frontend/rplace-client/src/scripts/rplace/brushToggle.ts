import { onMounted, onUnmounted, watch } from 'vue';
import { useBrushPanelStore } from '../../stores/brushPanel';
import { storeToRefs } from 'pinia';

export function useBrushToggle() {
  const brushStore = useBrushPanelStore();
  const { isBrushActive: isActive } = storeToRefs(brushStore);
  let intervalId: number | null = null;

  onMounted(() => {
    isActive.value = false;
  });

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
      brushStore.brushSize = 0;
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
