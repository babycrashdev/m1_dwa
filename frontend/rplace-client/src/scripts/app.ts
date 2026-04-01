
import { ref } from 'vue';

export function useApp() {
  const showAuth = ref(false);

  return {
    showAuth
  };
}
