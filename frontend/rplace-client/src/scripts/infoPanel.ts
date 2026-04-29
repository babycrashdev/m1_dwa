import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../stores/auth';

export function useInfoPanel() {
  const authStore = useAuthStore();
  const title = ref('Pseudo');
  const coordinateLabel = ref('Pays');
  const coordinateValue = ref('Age');
  const lastUser = ref('Pixels placés: ---');
  const lastTime = ref('Crédits: ---');

  onMounted(async () => {

    if (!authStore.isAuthenticated || !authStore.token) return;

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const response = await axios.get(`${apiUrl}/api/user/profile`, {
        headers: { Authorization: `Bearer ${authStore.token}` }
      });
      const data = response.data;

      title.value = data.username;
      coordinateLabel.value = data.country;
      coordinateValue.value = data.age + " ans";
      lastUser.value = `Pixels placés: ${data.pixelCount}`;
      lastTime.value = `Crédits: ${data.balance}✨`;
    } catch (error) {
      console.error("Erreur profil utilisateur:", error);
    }
  });

  return {
    title,
    coordinateLabel,
    coordinateValue,
    lastUser,
    lastTime
  };
}
