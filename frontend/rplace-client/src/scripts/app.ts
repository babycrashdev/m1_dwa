
import { watch } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useAppStore } from '../stores/app';
import { storeToRefs } from 'pinia';

export function useApp() {
  const authStore = useAuthStore();
  const appStore = useAppStore();
  
  const { showAuth, currentView } = storeToRefs(appStore);

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
