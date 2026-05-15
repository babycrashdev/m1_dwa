import { computed, ref } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useApp } from '../app';
import { useScoreboardStore, type ScoreboardEntry } from '../../stores/rplace/scoreboard';
import { useRPlaceStore } from '../../stores/rplace';
import { formatNumber } from './formatNumber';
import { formatTime } from './formatTime';

export function useProfileLogic() {
    const authStore = useAuthStore();
    const scoreboardStore = useScoreboardStore();
    const rplaceStore = useRPlaceStore();
    const { showAuth, toggleAuth, currentView } = useApp();

    const scoreboardEntry = computed(() => {
        if (!authStore.isAuthenticated || !authStore.user) return null;
        return scoreboardStore.entries.find(e => e.username === authStore.user?.username);
    });

    const profileData = computed<Partial<ScoreboardEntry>>(() => {
        if (scoreboardEntry.value) return scoreboardEntry.value;
        
        return {
            username: authStore.user?.username || 'Invité',
            country: authStore.user?.country || 'FR',
            moneys: 0,
            totalPixels: 0,
            pixelRecord: 0,
            passiveIncome: 0,
            clickBonus: 1
        };
    });

    const initials = computed(() => {
        return profileData.value.username?.charAt(0).toUpperCase() || '?';
    });

    const rank = computed(() => {
        if (!authStore.isAuthenticated || !authStore.user) return null;
        const sorted = scoreboardStore.getSortedEntries();
        const index = sorted.findIndex(e => e.username === authStore.user?.username);
        return index !== -1 ? index + 1 : null;
    });

    const domination = computed(() => {
        if (!profileData.value.totalPixels || !rplaceStore.gridSize) return '0%';
        const total = rplaceStore.gridSize * rplaceStore.gridSize;
        const pct = (profileData.value.totalPixels / total) * 100;
        return pct < 0.01 ? '<0.01%' : `${pct.toFixed(2)}%`;
    });

    return {
        authStore,
        currentView,
        profileData,
        rank,
        domination,
        initials,
        toggleAuth,
        showAuth,
        formatNumber,
        formatTime
    };
}
