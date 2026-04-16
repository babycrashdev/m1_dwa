import { computed } from 'vue';
import { useRPlaceStore } from '../../stores/rplace';
import { useAuthStore } from '../../stores/auth';

export function useColorPalette() {
  const store = useRPlaceStore();
  const authStore = useAuthStore();
  
  const colors = [
    '#FF4500', '#FFA800', '#FFD635', '#00A368', 
    '#3690EA', '#FFFFFF', '#811E9F', '#000000'
  ];

  const selectColor = (color: string) => {
    store.selectedColor = color;
  };

  return {
    colors,
    selectedColor: computed(() => store.selectedColor),
    isAuthenticated: computed(() => authStore.isAuthenticated),
    selectColor
  };
}
