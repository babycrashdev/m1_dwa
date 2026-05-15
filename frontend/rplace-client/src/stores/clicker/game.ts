import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';
import { useUpgradeStore } from './upgradeStore';
import { useDeliveryStore } from './deliveryStore';

export const useGameStore = defineStore('game', () => {
    const money = ref(0);
    const pendingSync = ref(0);
    const pendingClicks = ref(0);
    const pendingEntities = ref(0);
    const currentWeight = ref(0);
    const spawnProgress = ref(0);

    const SPAWN_INTERVAL_MS = 4000;
    const TICK_INTERVAL_MS = 50;

    const upgradeStore = useUpgradeStore();
    const deliveryStore = useDeliveryStore();

    function addWeight(amount: number = 1) {
        currentWeight.value += amount;
    }

    function registerClick() {
        pendingClicks.value++;
    }

    async function syncToBackend() {
        if (pendingSync.value === 0 && pendingClicks.value === 0 && pendingEntities.value === 0) return;

        const token = localStorage.getItem('token');
        if (!token) return;

        const amountToSync = pendingSync.value;
        /*FAIT AVEC IA*/
        const clicksToSync = pendingClicks.value;
        const entitiesToSync = pendingEntities.value;

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/user/clicker/sync`,
                {
                    amount: amountToSync,
                    clicks: clicksToSync,
                    entities: entitiesToSync
                },
                /*FIN IA*/
                { headers: { Authorization: `Bearer ${token}` } }
            );

            pendingSync.value -= amountToSync;
            pendingClicks.value -= clicksToSync;
            pendingEntities.value -= entitiesToSync;
            console.log("[Game] Synchronisation réussie");
        } catch (error) {
            console.error("[Game] Échec de la synchronisation:", error);
        }
    }

    function spawnGroupedCar() {
        if (currentWeight.value > 0) {
            deliveryStore.startDelivery(currentWeight.value);
            currentWeight.value = 0;
        }
    }

    let progressInterval: number | null = null;
    function startSpawnerTimer() {
        if (progressInterval) return;

        console.log("[Game] Démarrage du timer (4s)");
        progressInterval = window.setInterval(() => {
            spawnProgress.value += (TICK_INTERVAL_MS / SPAWN_INTERVAL_MS) * 100;

            if (spawnProgress.value >= 100) {
                spawnProgress.value = 0;
                spawnGroupedCar();
            }
        }, TICK_INTERVAL_MS);
    }

    function stopSpawnerTimer() {
        if (progressInterval) {
            window.clearInterval(progressInterval);
            progressInterval = null;
        }
    }

    return {
        money,
        currentWeight,
        spawnProgress,
        pendingSync,
        pendingClicks,
        pendingEntities,
        addWeight,
        registerClick,
        startSpawnerTimer,
        stopSpawnerTimer,
        syncToBackend
    };
});
