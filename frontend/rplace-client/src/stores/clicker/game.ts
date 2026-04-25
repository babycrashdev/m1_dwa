import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';
import { useUpgradeStore } from './upgradeStore';

export const useGameStore = defineStore('game', () => {
    const money = ref(0);
    const pendingSync = ref(0);
    const currentWeight = ref(0);
    const spawnProgress = ref(0);
    
    const SPAWN_INTERVAL_MS = 4000;
    const TICK_INTERVAL_MS = 50;
    
    const upgradeStore = useUpgradeStore();

    function addWeight(amount: number = 1) {
        currentWeight.value += amount;
    }

    async function syncToBackend() {
        if (pendingSync.value === 0) return;

        const token = localStorage.getItem('token');
        if (!token) return;

        const amountToSync = pendingSync.value;
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/clicker/sync`,
                { amount: amountToSync },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            pendingSync.value -= amountToSync;
            console.log("[Game] Synchronisation réussie");
        } catch (error) {
            console.error("[Game] Échec de la synchronisation:", error);
        }
    }

    function spawnGroupedCar() {
        if (currentWeight.value > 0) {
            const carValue = upgradeStore.config?.global.baseCarValue || 10;
            const totalValue = currentWeight.value * carValue;
            
            console.log(`[Game] Expédition de ${currentWeight.value} voitures pour ${totalValue} money`);
            
            money.value += totalValue;
            pendingSync.value += totalValue;
            currentWeight.value = 0;

            // TODO: Animation + mouvement
            syncToBackend();
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
        addWeight,
        startSpawnerTimer,
        stopSpawnerTimer
    };
});
