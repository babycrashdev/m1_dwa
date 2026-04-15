import { ref, onMounted } from 'vue';
import { useRPlaceStore } from '../../stores/rplace';

export function useRPlaceBoard() {
  const store = useRPlaceStore();
  const canvasRef = ref<HTMLCanvasElement | null>(null);

  onMounted(() => {
    // Canvas
  });

  return {
    canvasRef
  };
}
