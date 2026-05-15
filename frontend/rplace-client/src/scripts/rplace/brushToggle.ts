import { onMounted, onUnmounted, watch, computed } from 'vue';
import { useBrushPanelStore } from '../../stores/rplace/brushPanel.ts';
import { storeToRefs } from 'pinia';

export function useBrushToggle(shape: 'square' | 'circle' = 'square') {
  const brushStore = useBrushPanelStore();
  const { isBrushActive, brushShape } = storeToRefs(brushStore);
  
  const isActive = computed(() => isBrushActive.value && brushShape.value === shape);
  let intervalId: number | null = null;

  onMounted(() => {
    // We don't reset isBrushActive here because it might be active from another shape
  });

  const toggle = () => {
    brushStore.toggleBrush(shape);
  };

  watch(isActive, (newValue) => {
    if (newValue) {
      console.log(`Pinceau ${shape} activé`);
    } else {
      console.log(`Pinceau ${shape} désactivé`);
      if (!isBrushActive.value && intervalId) {
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
