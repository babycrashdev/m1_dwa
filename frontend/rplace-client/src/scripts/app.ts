import { watch, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useAppStore } from '../stores/app';
import { useGameStore } from '../stores/clicker/game';
import { useUpgradeStore } from '../stores/clicker/upgradeStore';
import { storeToRefs } from 'pinia';
import axios from 'axios';

export function useApp() {
  const authStore = useAuthStore();
  const appStore = useAppStore();
  const gameStore = useGameStore();
  
  const { showAuth, currentView } = storeToRefs(appStore);

  const upgradeStore = useUpgradeStore();

  onMounted(async () => {
    await upgradeStore.fetchConfig();

    if (authStore.isAuthenticated && authStore.token) {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/me`, {
                headers: { Authorization: `Bearer ${authStore.token}` }
            });
            authStore.setUser(response.data);
            
            await upgradeStore.fetchState();
            gameStore.startSpawnerTimer();
            upgradeStore.startProductionLoop();
        } catch (error) {
            console.error("Impossible de restaurer le profil:", error);
        }
    }
  });

  watch(() => authStore.isAuthenticated, async (isAuth) => {
    if (isAuth) {
      await upgradeStore.fetchState();
      gameStore.startSpawnerTimer();
      upgradeStore.startProductionLoop();
    } else {
      gameStore.stopSpawnerTimer();
      upgradeStore.stopProductionLoop();
      if (currentView.value === 'clicker') {
        currentView.value = 'grid';
      }
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
