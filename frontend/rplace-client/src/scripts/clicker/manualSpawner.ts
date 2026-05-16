import { useGameStore } from '../../stores/clicker/game';
import { computed, onMounted } from 'vue';

export function useManualSpawner() {
    const gameStore = useGameStore();

    const addWeight = () => {
        gameStore.addWeight();
    };

    const currentWeight = computed(() => gameStore.currentWeight);
    const progress = computed(() => gameStore.spawnProgress);

    onMounted(() => {
        gameStore.startSpawnerTimer();
    });

    return {
        addWeight,
        currentWeight,
        progress
    };
}
