import { watch, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useAppStore } from '../stores/app';
import { useGameStore } from '../stores/game';
import { storeToRefs } from 'pinia';
import axios from 'axios';

export function useApp() {
  const authStore = useAuthStore();
  const appStore = useAppStore();
  const gameStore = useGameStore();
  
  const { showAuth, showLeaderboard, currentView } = storeToRefs(appStore);

  onMounted(async () => {
    if (authStore.isAuthenticated && authStore.token) {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/me`, {
                headers: { Authorization: `Bearer ${authStore.token}` }
            });
            authStore.setUser(response.data);
            gameStore.money = response.data.moneys || 0;
            console.log("Profil restauré depuis le backend:", response.data.moneys);
        } catch (error) {
            console.error("Impossible de restaurer le profil:", error);
        }
    }
  });

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

  const toggleLeaderboard = () => {
    showLeaderboard.value = !showLeaderboard.value;
  };

  return {
    showAuth,
    showLeaderboard,
    currentView,
    switchView,
    toggleAuth,
    toggleLeaderboard
  };
}
