import { watch, computed } from 'vue';
import { useBrushPanelStore } from '../../stores/rplace/brushPanel.ts';
import { storeToRefs } from 'pinia';

export function useBrushToggle(shape: 'square' | 'circle' = 'square') {
  const brushStore = useBrushPanelStore();
  const { isBrushActive, brushShape } = storeToRefs(brushStore);

  const isActive = computed(() => isBrushActive.value && brushShape.value === shape);

  const toggle = () => {
    if (isBrushActive.value && brushShape.value === shape) {
      isBrushActive.value = false;
    } else {
      isBrushActive.value = true;
      brushStore.handleShapeChange(shape);
    }
  };

  watch(isBrushActive, (newValue) => {
    if (!newValue) {
      brushStore.brushSize = 0;
    }
  });

  return {
    isActive,
    toggle
  };
}
