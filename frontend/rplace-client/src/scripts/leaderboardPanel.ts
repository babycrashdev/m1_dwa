import { ref, onMounted } from 'vue';
import axios from 'axios';

export function useLeaderboardPanel() {
  const topPixels = ref<{username: string, score: number}[]>([]);
  const topCredits = ref<{username: string, balance: number}[]>([]);

  onMounted(async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      
      const [pixelsRes, creditsRes] = await Promise.all([
        axios.get(`${apiUrl}/api/leaderboard/top-pixels`),
        axios.get(`${apiUrl}/api/leaderboard/top-credits`)
      ]);

      topPixels.value = pixelsRes.data;
      topCredits.value = creditsRes.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des classements:", error);
    }
  });

  return {
    topPixels,
    topCredits
  };
}
