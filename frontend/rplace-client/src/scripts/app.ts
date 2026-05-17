/* Aider par l'IA pour structurer et faire fonctionner correctement */
import { watch, onMounted, ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useAppStore } from '../stores/app';
import { useGameStore } from '../stores/clicker/game';
import { useUpgradeStore } from '../stores/clicker/upgradeStore';
import { useMapStore } from '../stores/clicker/mapStore';
import { useRPlaceStore } from '../stores/rplace';
import { useLoadingStore } from '../stores/common/loadingStore';
import { storeToRefs } from 'pinia';
import axios from 'axios';

export function useApp() {
  const authStore = useAuthStore();
  const appStore = useAppStore();
  const gameStore = useGameStore();
  const rplaceStore = useRPlaceStore();
  const upgradeStore = useUpgradeStore();
  const loadingStore = useLoadingStore();
  
  const { showAuth, currentView } = storeToRefs(appStore);

  onMounted(async () => {
    loadingStore.performTransition(async () => {
        try {
            const promises: Promise<any>[] = [
                upgradeStore.fetchConfig(),
                rplaceStore.fetchConfig(),
                loadingStore.fetchTips()
            ];

            if (currentView.value === 'grid') {
                promises.push(rplaceStore.fetchInitialBoard());
            }

            await Promise.all(promises);
        } catch (error) {
            console.error("Erreur lors du chargement initial:", error);
        }
    });

    if (authStore.isAuthenticated && authStore.token) {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/me`, {
                headers: { Authorization: `Bearer ${authStore.token}` }
            });
            authStore.setUser(response.data);
            
            await upgradeStore.fetchState();
            const mapStore = useMapStore();
            await mapStore.fetchMapState();
            
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
      const mapStore = useMapStore();
      await mapStore.fetchMapState();

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
    
    loadingStore.performTransition(() => {
        currentView.value = view;
        showAuth.value = false;
    });
  };

  const toggleAuth = () => {
    showAuth.value = !showAuth.value;
  };

  const showStatsModal = ref(false);
  const statsUsername = ref('');

  const openStats = (username: string) => {
    statsUsername.value = username;
    showStatsModal.value = true;
  };

  const closeStats = () => {
    showStatsModal.value = false;
  };

  return {
    showAuth,
    currentView,
    switchView,
    toggleAuth,
    showStatsModal,
    statsUsername,
    openStats,
    closeStats
  };
}
