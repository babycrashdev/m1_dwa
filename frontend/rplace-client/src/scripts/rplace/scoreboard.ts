import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useScoreboardStore, type SortKey } from '../../stores/rplace/scoreboard';
import { useAuthStore } from '../../stores/auth';
import { useRPlaceStore } from '../../stores/rplace';
import { formatNumber } from '../common/formatNumber';
import { formatTime } from '../common/formatTime';

export function useScoreboardLogic() {
    const store = useScoreboardStore();
    const authStore = useAuthStore();
    const rplaceStore = useRPlaceStore();

    const currentUsername = computed(() => authStore.user?.username ?? '');
    const totalCells = computed(() => rplaceStore.gridSize * rplaceStore.gridSize);

    function formatPercent(pixels: number): string {
        if (!totalCells.value) return '';
        const pct = (pixels / totalCells.value) * 100;
        return pct < 0.01 ? '<0.01%' : `${pct.toFixed(2)}%`;
    }

    const sortOptions: { key: SortKey; label: string; icon: string }[] = [
        { key: 'totalPixels', label: 'Pixels', icon: '🎨' },
        { key: 'moneys', label: 'Crédits', icon: '💰' },
        { key: 'pixelRecord', label: 'Record', icon: '⏱️' },
    ];

    const searchQuery = ref('');

    const displayEntries = computed(() => {
        const query = searchQuery.value.toLowerCase().trim();
        const sorted = store.getSortedEntries();
        
        return sorted
            .map((entry, index) => ({
                ...entry,
                originalRank: index + 1
            }))
            .filter(entry => 
                !query || entry.username.toLowerCase().includes(query)
            );
    });

    const topFivePixels = computed(() => {
        return [...store.entries]
            .sort((a, b) => b.totalPixels - a.totalPixels)
            .slice(0, 5)
            .map((entry, index) => ({
                ...entry,
                originalRank: index + 1
            }));
    });

    onMounted(() => store.startPolling());
    onUnmounted(() => store.stopPolling());

    return {
        store,
        currentUsername,
        sortOptions,
        displayEntries,
        topFivePixels,
        searchQuery,
        formatPercent,
        formatNumber,
        formatTime
    };
}
