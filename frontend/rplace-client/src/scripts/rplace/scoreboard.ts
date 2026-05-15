import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useScoreboardStore, type SortKey } from '../../stores/rplace/scoreboard';
import { useAuthStore } from '../../stores/auth';
import { useRPlaceStore } from '../../stores/rplace';
import { formatNumber } from '../common/formatNumber';
import { formatTime } from '../common/formatTime';

export function useScoreboardLogic() {
    const store = useScoreboardStore();
    const authStore = useAuthStore();
    const rplaceStore = useRPlaceStore();

    const searchQuery = ref('');

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

    const sorted = computed(() => store.getSortedEntries());

    const filteredEntries = computed(() => {
        if (!searchQuery.value) return [];
        const query = searchQuery.value.toLowerCase();
        return store.entries.filter(entry => 
            entry.username.toLowerCase().includes(query)
        );
    });

    onMounted(() => store.startPolling());
    onUnmounted(() => store.stopPolling());

    return {
        store,
        searchQuery,
        currentUsername,
        sortOptions,
        sorted,
        filteredEntries,
        formatPercent,
        formatNumber,
        formatTime
    };
}
