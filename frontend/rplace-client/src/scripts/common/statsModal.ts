import { ref, onMounted, computed } from 'vue';
import { useStatsStore, type UserStats } from '../../stores/stats';
import { formatNumber } from './formatNumber';
import { formatTime } from './formatTime';

export function useStatsModalLogic(username: string) {
    const statsStore = useStatsStore();
    const activeTab = ref<'rplace' | 'clicker'>('rplace');
    const stats = ref<UserStats | null>(null);
    const loading = ref(true);

    const survivalTime = computed(() => {
        if (!stats.value?.oldestActivePixelDate) return 'Aucun pixel actif';
        
        const oldest = new Date(stats.value.oldestActivePixelDate);
        const diff = Date.now() - oldest.getTime();
        const seconds = Math.floor(diff / 1000);
        
        return formatTime(seconds);
    });

    onMounted(async () => {
        loading.value = true;
        stats.value = await statsStore.fetchUserStats(username);
        loading.value = false;
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
