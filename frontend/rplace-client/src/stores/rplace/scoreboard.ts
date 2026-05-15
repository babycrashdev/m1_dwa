import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../auth';

export type SortKey = 'moneys' | 'totalUpgradeLevels' | 'unlockedSlots' | 'totalPixels' | 'pixelRecord';

export interface ScoreboardEntry {
    username: string;
    country: string;
    moneys: number;
    totalUpgradeLevels: number;
    unlockedSlots: number;
    totalPixels: number;
    pixelRecord: number;
    passiveIncome: number;
    clickBonus: number;
}

export const useScoreboardStore = defineStore('scoreboard', () => {
    const authStore = useAuthStore();
    const entries = ref<ScoreboardEntry[]>([]);
    const sortKey = ref<SortKey>('moneys');
    const isLoading = ref(false);
    const lastUpdated = ref<Date | null>(null);

    let pollInterval: number | null = null;

    async function fetchScoreboard() {
        if (!authStore.token) return;
        isLoading.value = true;
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/scoreboard`,
                { headers: { Authorization: `Bearer ${authStore.token}` } }
            );
            entries.value = response.data;
            lastUpdated.value = new Date();
        } catch (error) {
            console.error('[Scoreboard] Erreur de chargement:', error);
        } finally {
            isLoading.value = false;
        }
    }

    function getSortedEntries(): ScoreboardEntry[] {
        return [...entries.value].sort((a, b) => b[sortKey.value] - a[sortKey.value]);
    }

    function setSortKey(key: SortKey) {
        sortKey.value = key;
    }

    function startPolling() {
        fetchScoreboard();
    }

    function stopPolling() {
    }

    return {
        entries,
        sortKey,
        isLoading,
        lastUpdated,
        fetchScoreboard,
        getSortedEntries,
        setSortKey,
        startPolling,
        stopPolling,
    };
});
