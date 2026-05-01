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
    id: string; 
    category: string;
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
    const levels = ref<Record<string, number>>({});

    const cycleProgress = ref(0);
    let tickerInterval: number | null = null;
    const TICK_RATE_MS = 100;

    function getLevel(id: string, subType: string = 'main'): number {
        if (!id) return 0;
        const upperId = id.toUpperCase();
        const key = subType === 'main' ? `${upperId}_level` : `${upperId}_${subType}`;
        return levels.value[key] || 0;
    }

    const groupedUpgrades = computed(() => {
        if (!config.value || !config.value.upgrades) return {};
        const groups: Record<string, UpgradeConfig[]> = {};
        
        Object.entries(config.value.upgrades).forEach(([id, upgrade]) => {
            const upperId = id.toUpperCase();
            const cat = (upgrade.category || 'OTHER').toUpperCase();
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push({ ...upgrade, id: upperId });
        });
        
        return groups;
    });

    const productionPerWorker = computed(() => {
        if (!config.value || !config.value.upgrades) return 0;
        const workerCfg = config.value.upgrades.WORKER || config.value.upgrades.worker;
        if (!workerCfg) return 0;
        
        const prodLevel = getLevel('WORKER', 'production');
        const bonus = prodLevel * (workerCfg.upgrades.production?.increasePerLevel || 0);
        return (workerCfg.baseProduction || 1) + bonus;
    });

    const currentIntervalMs = computed(() => {
        if (!config.value || !config.value.upgrades) return 10000;
        const workerCfg = config.value.upgrades.WORKER || config.value.upgrades.worker;
        if (!workerCfg) return 10000;
        
        const effLevel = getLevel('WORKER', 'efficiency');
        const reduction = effLevel * (workerCfg.upgrades.efficiency?.reductionPerLevelMs || 0);
        return Math.max(1000, (workerCfg.baseIntervalMs || 10000) - reduction);
    });

    // Calcul du bonus total des bâtiments pour la valeur des voitures
    const totalBuildingBonus = computed(() => {
        if (!config.value || !config.value.upgrades) return 0;
        let total = 0;
        
        Object.entries(config.value.upgrades).forEach(([id, upgrade]) => {
            if (upgrade.category?.toUpperCase() === 'BUILDING') {
                const valLevel = getLevel(id, 'value');
                const bonusPerLevel = upgrade.upgrades.value?.increasePerLevel || 0;
                total += valLevel * bonusPerLevel;
            }
        });
        
        return total;
    });

    async function fetchConfig() {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/config/clicker`);
            config.value = response.data;
            console.log("[UpgradeStore] Config chargée:", config.value);
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
            console.log("[UpgradeStore] État chargé:", levels.value);
        } catch (error) {
            console.error("Erreur chargement état upgrades", error);
        }
    }

    async function buyUpgrade(type: string, subType: string = 'main') {
        if (!authStore.token) return;
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/clicker/upgrade`, 
                { type: type.toUpperCase(), subType },
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
            const workerCount = getLevel('WORKER');
            if (!authStore.isAuthenticated || workerCount === 0) {
                cycleProgress.value = 0;
                return;
            }

            const increment = (TICK_RATE_MS / currentIntervalMs.value) * 100;
            cycleProgress.value += increment;

            if (cycleProgress.value >= 100) {
                cycleProgress.value = 0;
                const totalProduction = workerCount * productionPerWorker.value;
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
        groupedUpgrades,
        totalBuildingBonus,
        getLevel,
        fetchConfig,
        fetchState,
        buyUpgrade,
        startProductionLoop,
        stopProductionLoop
    };
});
