import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../auth';
import { useGameStore } from './game';

export interface SubUpgradeConfig {
    basePrice: number;
    priceMultiplier: number;
    reductionPerLevelMs?: number;
    increasePerLevel?: number;
}

export interface UpgradeConfig {
    basePrice: number;
    priceMultiplier: number;
    baseIntervalMs?: number;
    baseProduction?: number;
    upgrades: Record<string, SubUpgradeConfig>;
}

export interface ClickerConfig {
    global: { syncIntervalMs: number; baseCarValue: number };
    upgrades: Record<string, UpgradeConfig>;
}

export const useUpgradeStore = defineStore('upgrade', () => {
    const authStore = useAuthStore();
    const gameStore = useGameStore();

    const config = ref<ClickerConfig | null>(null);
    const levels = ref({
        workerCount: 0,
        efficiencyLevel: 0,
        productionLevel: 0
    });

    const cycleProgress = ref(0);
    let tickerInterval: number | null = null;
    const TICK_RATE_MS = 100;

    const productionPerWorker = computed(() => {
        if (!config.value) return 0;
        const workerCfg = config.value.upgrades.WORKER;
        if (!workerCfg) return 0;
        const bonus = levels.value.productionLevel * (workerCfg.upgrades.production?.increasePerLevel || 0);
        return (workerCfg.baseProduction || 1) + bonus;
    });

    const currentIntervalMs = computed(() => {
        if (!config.value) return 10000;
        const workerCfg = config.value.upgrades.WORKER;
        if (!workerCfg) return 10000;
        const reduction = levels.value.efficiencyLevel * (workerCfg.upgrades.efficiency?.reductionPerLevelMs || 0);
        return Math.max(1000, (workerCfg.baseIntervalMs || 10000) - reduction);
    });

    async function fetchConfig() {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/config/clicker`);
            config.value = response.data;
        } catch (error) {
            console.error("Erreur chargement config upgrades", error);
        }
    }

    async function fetchState() {
        if (!authStore.token) return;
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/clicker/state`, {
                headers: { Authorization: `Bearer ${authStore.token}` }
            });
            gameStore.money = response.data.balance;
            levels.value = response.data.upgradeLevels;
        } catch (error) {
            console.error("Erreur chargement état upgrades", error);
        }
    }

    async function buyUpgrade(type: string, subType: string = 'main') {
        if (!authStore.token) return;
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/clicker/upgrade`, 
                { type: type.toLowerCase(), subType },
                { headers: { Authorization: `Bearer ${authStore.token}` } }
            );
            gameStore.money = response.data.balance;
            levels.value = response.data.upgradeLevels;
        } catch (error: any) {
            console.error("Erreur achat", error.response?.data || error.message);
        }
    }

    function startProductionLoop() {
        if (tickerInterval) return;
        
        tickerInterval = window.setInterval(() => {
            if (!authStore.isAuthenticated || levels.value.workerCount === 0) {
                cycleProgress.value = 0;
                return;
            }

            const increment = (TICK_RATE_MS / currentIntervalMs.value) * 100;
            cycleProgress.value += increment;

            if (cycleProgress.value >= 100) {
                cycleProgress.value = 0;
                const totalProduction = levels.value.workerCount * productionPerWorker.value;
                gameStore.addWeight(totalProduction);
            }
        }, TICK_RATE_MS);
    }

    function stopProductionLoop() {
        if (tickerInterval) {
            window.clearInterval(tickerInterval);
            tickerInterval = null;
        }
    }

    return {
        config,
        levels,
        cycleProgress,
        productionPerWorker,
        currentIntervalMs,
        fetchConfig,
        fetchState,
        buyUpgrade,
        startProductionLoop,
        stopProductionLoop
    };
});
