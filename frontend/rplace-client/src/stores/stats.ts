import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';
import { useAuthStore } from './auth';
import { useRPlaceStore } from './rplace';

export interface UserStats {
    totalPixelsPlaced: number;
    timesOverwritten: number;
    totalClicks: number;
    totalParcelsGenerated: number;
    totalMoneyGenerated: number;
    totalMoneySpent: number;
    mostExpensivePixelPrice: number;
    totalGameTimeSeconds: number;
    oldestActivePixelDate: string | null;
}

export const useStatsStore = defineStore('stats', () => {
    const authStore = useAuthStore();
    const rplaceStore = useRPlaceStore();
    const myStats = ref<UserStats | null>(null);
    const isLoading = ref(false);

    async function fetchMyStats() {
        if (!authStore.isAuthenticated || !authStore.user) return;
        isLoading.value = true;
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/user/${authStore.user.username}/stats`,
                { headers: { Authorization: `Bearer ${authStore.token}` } }
            );
            myStats.value = response.data;
        } catch (error) {
            console.error('[StatsStore] Erreur chargement stats:', error);
        } finally {
            isLoading.value = false;
        }
    }

    async function fetchUserStats(username: string): Promise<UserStats | null> {
        try {
            const headers: any = {};
            if (authStore.token) {
                headers.Authorization = `Bearer ${authStore.token}`;
            }
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/user/${username}/stats`,
                { headers }
            );
            return response.data;
        } catch (error) {
            console.error(`[StatsStore] Erreur chargement stats ${username}:`, error);
            return null;
        }
    }

    function handleWsUpdate(data: any) {
        myStats.value = {
            ...myStats.value,
            ...data
        };
    }

    function subscribeToMyStats() {
        if (!authStore.user || !rplaceStore.stompClient) return;

        const topic = `/topic/stats/${authStore.user.username}`;
        rplaceStore.stompClient.subscribe(topic, (message) => {
            const data = JSON.parse(message.body);
            handleWsUpdate(data);
        });
        console.log(`[StatsStore] Abonné au topic: ${topic}`);
    }

    return {
        myStats,
        isLoading,
        fetchMyStats,
        fetchUserStats,
        subscribeToMyStats
    };
});
