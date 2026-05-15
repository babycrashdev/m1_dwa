import { ref, computed, onMounted, onUnmounted, watch, reactive } from 'vue';
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
    const flashingEntries = reactive<Record<string, boolean>>({});

    const currentUsername = computed(() => authStore.user?.username ?? '');
    const totalCells = computed(() => rplaceStore.gridSize * rplaceStore.gridSize);

    function formatPercent(pixels: number): string {
        if (!totalCells.value) return '';
        const pct = (pixels / totalCells.value) * 100;
        return pct < 0.01 ? '<0.01%' : `${pct.toFixed(2)}%`;
    }

    const sortOptions: { key: SortKey; label: string; icon: string }[] = [
        { key: 'pixelsOnMap', label: 'Pixels', icon: '🎨' },
        { key: 'currentMoneys', label: 'Moneys', icon: '💰' },
        { key: 'pixelRecord', label: 'Âge pixel', icon: '⏱️' },
    ];

    const displayEntries = computed(() => {
        const sorted = store.sortedEntries;
        const mapped = sorted.map((entry, index) => ({
            ...entry,
            rank: index + 1
        }));

        if (!searchQuery.value) return mapped;

        const query = searchQuery.value.toLowerCase();
        return mapped.filter(entry =>
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

    // Re-sync selected player when entries update to ensure real-time values
    watch(() => store.entries, (newEntries, oldEntries) => {
        // Handle selected player sync
        if (selectedPlayer.value) {
            const updated = newEntries.find(e => e.username === selectedPlayer.value?.username);
            if (updated) {
                selectedPlayer.value = updated;
            }
        }

        // Handle flash animations
        if (!oldEntries || oldEntries.length === 0) return;

        newEntries.forEach(newEntry => {
            const oldEntry = oldEntries.find(e => e.username === newEntry.username);
            if (oldEntry) {
                const key = store.sortKey;
                if ((newEntry as any)[key] !== (oldEntry as any)[key]) {
                    const flashKey = `${newEntry.username}-${key}`;
                    flashingEntries[flashKey] = true;
                    setTimeout(() => {
                        flashingEntries[flashKey] = false;
                    }, 1000);
                }
            }
        });
    }, { deep: true });

    onMounted(() => store.startPolling());
    onUnmounted(() => store.stopPolling());

    return {
        store,
        searchQuery,
        selectedPlayer,
        currentUsername,
        sortOptions,
        displayEntries,
        flashingEntries,
        selectPlayer,
        backToList,
        formatPercent,
        formatNumber,
        formatTime
    };
}
