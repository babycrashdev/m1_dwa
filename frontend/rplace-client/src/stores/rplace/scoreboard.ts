import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../auth';

export type SortKey = 'currentMoneys' | 'pixelsOnMap' | 'pixelRecord' | 'totalClicks' | 'totalEntitiesGenerated' | 'totalMoneySpent' | 'totalMoneyGenerated';

export interface ScoreboardEntry {
    username: string;
    country: string;
    totalClicks: number;
    totalEntitiesGenerated: number;
    totalMoneySpent: number;
    totalMoneyGenerated: number;
    pixelsOnMap: number;
    currentMoneys: number;
    pixelRecord: number;
}

export const useScoreboardStore = defineStore('scoreboard', () => {
    const authStore = useAuthStore();
    const entries = ref<ScoreboardEntry[]>([]);
    const sortKey = ref<SortKey>('pixelsOnMap');
    const isLoading = ref(false);
    const lastUpdated = ref<Date | null>(null);
    let pollingInterval: number | null = null;

    async function fetchScoreboard() {
        console.log("[Scoreboard] Récupération des données depuis l'API...");
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/leaderboard`);
            entries.value = response.data;
            lastUpdated.value = new Date();
        } catch (error) {
            console.error('[Scoreboard] Erreur de chargement:', error);
        } finally {
            isLoading.value = false;
        }
    }

    // Changement ici : on utilise un computed pour que ce soit réactif à 100%
    const sortedEntries = computed(() => {
        return [...entries.value].sort((a, b) => {
            const valA = (a as any)[sortKey.value] || 0;
            const valB = (b as any)[sortKey.value] || 0;
            return valB - valA;
        });
    });

    function setSortKey(key: SortKey) {
        sortKey.value = key;
    }

    function startPolling() {
        if (pollingInterval) return;
        fetchScoreboard();
        pollingInterval = window.setInterval(fetchScoreboard, 1000);
    }

    function stopPolling() {
        if (pollingInterval) {
            window.clearInterval(pollingInterval);
            pollingInterval = null;
        }
    }

    return {
        entries,
        sortKey,
        isLoading,
        lastUpdated,
        fetchScoreboard,
        sortedEntries, // On exporte le computed
        setSortKey,
        startPolling,
        stopPolling,
    };
});
