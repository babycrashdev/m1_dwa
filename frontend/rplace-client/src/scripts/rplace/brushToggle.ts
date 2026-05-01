import { ref, onUnmounted, watch } from 'vue';

export function useBrushToggle() {
  const isActive = ref(false);
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
