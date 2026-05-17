/* Aider par l'IA pour structurer et faire fonctionner correctement */
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useStatsStore, type UserStats } from '../../stores/stats';
import { useAuthStore } from '../../stores/auth';
import { formatNumber } from './formatNumber';
import { formatTime } from './formatTime';

export function useStatsModalLogic(username: string) {
    const statsStore = useStatsStore();
    const authStore = useAuthStore();
    const activeTab = ref<'rplace' | 'clicker'>('rplace');
    const stats = ref<UserStats | null>(null);
    const loading = ref(true);
    const now = ref(Date.now());
    let intervalId: number;

    const survivalTime = computed(() => {
        if (!stats.value?.oldestActivePixelDate) return 'Aucun pixel actif';
        
        let dateStr = stats.value.oldestActivePixelDate;
        if (!dateStr.endsWith('Z')) dateStr += 'Z';
        
        const oldest = new Date(dateStr);
        const diff = now.value - oldest.getTime();
        const seconds = Math.floor(diff / 1000);
        
        return formatTime(seconds >= 0 ? seconds : 0);
    });

    onMounted(async () => {
        loading.value = true;
        stats.value = await statsStore.fetchUserStats(username);
        loading.value = false;
        
        intervalId = window.setInterval(() => {
            now.value = Date.now();
        }, 1000);
    });

    watch(() => statsStore.myStats, (newStats) => {
        if (authStore.user?.username === username && newStats) {
            stats.value = { ...newStats };
        }
    }, { deep: true });

    onUnmounted(() => {
        if (intervalId) window.clearInterval(intervalId);
    });

    return {
        activeTab,
        stats,
        loading,
        survivalTime,
        formatNumber,
        formatTime
    };
}
