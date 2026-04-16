import { computed } from 'vue';
import { useRPlaceStore } from '../../stores/rplace';

export function useCooldownTimer() {
  const store = useRPlaceStore();
  
  const timeLeft = computed(() => store.cooldownSeconds);

  return {
    timeLeft
  };
}
