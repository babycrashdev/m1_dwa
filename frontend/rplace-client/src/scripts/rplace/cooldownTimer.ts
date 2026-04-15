import { ref } from 'vue';
import { useRPlaceStore } from '../../stores/rplace';

export function useCooldownTimer() {
  const store = useRPlaceStore();
  const timeLeft = ref(0);

  return {
    timeLeft
  };
}
