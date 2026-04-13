
import { ref, watch } from 'vue';
import { useAuthStore } from '../stores/auth';

export function useApp() {
  const authStore = useAuthStore();
  const showAuth = ref(false);
  const currentView = ref<'grid' | 'clicker'>('grid');

  watch(() => authStore.isAuthenticated, (isAuth) => {
    if (!isAuth && currentView.value === 'clicker') {
      currentView.value = 'grid';
    }
  });

  const switchView = (view: 'grid' | 'clicker') => {
    if (view === 'clicker' && !authStore.isAuthenticated) {
      showAuth.value = true;
      return;
    }
    currentView.value = view;
    showAuth.value = false;
  };

  const toggleAuth = () => {
    showAuth.value = !showAuth.value;
  };

  return {
    showAuth,
    currentView,
    switchView,
    toggleAuth
  };
}
