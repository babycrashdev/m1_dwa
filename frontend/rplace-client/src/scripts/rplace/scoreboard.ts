import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useScoreboardStore, type SortKey, type ScoreboardEntry } from '../../stores/rplace/scoreboard';
import { useAuthStore } from '../../stores/auth';
import { useRPlaceStore } from '../../stores/rplace';
import { formatNumber } from '../common/formatNumber';
import { formatTime } from '../common/formatTime';

export function useScoreboardLogic() {
    const store = useScoreboardStore();
    const authStore = useAuthStore();
    const rplaceStore = useRPlaceStore();

    const searchQuery = ref('');
    const selectedPlayer = ref<ScoreboardEntry | null>(null);

    const currentUsername = computed(() => authStore.user?.username ?? '');
    const totalCells = computed(() => rplaceStore.gridSize * rplaceStore.gridSize);

    function formatPercent(pixels: number): string {
        if (!totalCells.value) return '';
        const pct = (pixels / totalCells.value) * 100;
        return pct < 0.01 ? '<0.01%' : `${pct.toFixed(2)}%`;
    }

    const sortOptions: { key: SortKey; label: string; icon: string }[] = [
        { key: 'pixelsOnMap', label: 'Pixels', icon: '🎨' },
        { key: 'currentMoneys', label: 'Crédits', icon: '💰' },
        { key: 'pixelRecord', label: 'Record', icon: '⏱️' },
        { key: 'totalClicks', label: 'Clics', icon: '🖱️' },
        { key: 'totalEntitiesGenerated', label: 'Voitures', icon: '🚗' },
        { key: 'totalMoneyGenerated', label: 'Gains', icon: '📈' },
    ];

    const sorted = computed(() => store.sortedEntries);

    const filteredEntries = computed(() => {
        if (!searchQuery.value) return [];
        const query = searchQuery.value.toLowerCase();
        return store.entries.filter(entry => 
            entry.username.toLowerCase().includes(query)
        );
    });

    const selectPlayer = (player: ScoreboardEntry) => {
        selectedPlayer.value = player;
    };

    const backToList = () => {
        selectedPlayer.value = null;
    };

    // Close detail view when search query changes
    watch(searchQuery, () => {
        if (selectedPlayer.value) selectedPlayer.value = null;
    });

    onMounted(() => store.startPolling());
    onUnmounted(() => store.stopPolling());

    return {
        store,
        searchQuery,
        selectedPlayer,
        currentUsername,
        sortOptions,
        sorted,
        filteredEntries,
        selectPlayer,
        backToList,
        formatPercent,
        formatNumber,
        formatTime
    };
}
