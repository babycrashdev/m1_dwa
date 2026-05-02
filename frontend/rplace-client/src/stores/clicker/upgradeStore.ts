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

export interface BoostConfig {
    durationMs: number;
    cooldownMs: number;
    increaseDurationMs: number;
}

export interface UpgradeConfig {
    id: string; 
    category: string;
    basePrice: number;
    priceMultiplier: number;
    baseIntervalMs?: number;
    baseProduction?: number;
    bonusValueBonus?: number;
    boosts?: BoostConfig;
    upgrades: Record<string, SubUpgradeConfig>;
}

export interface UpgradeStatus {
    level: number;
    efficiency: number;
    production: number;
    lastBoostAt?: number;
    lastAutoBonusAt?: number;
}

export interface ClickerConfig {
    global: { syncIntervalMs: number; baseCarValue: number };
    upgrades: Record<string, UpgradeConfig>;
}

export const useUpgradeStore = defineStore('upgrade', () => {
    const authStore = useAuthStore();
    const gameStore = useGameStore();

    const config = ref<ClickerConfig | null>(null);
    const levels = ref<Record<string, UpgradeStatus>>({});
    const currentTime = ref(Date.now());

    const cycleProgress = ref<Record<string, number>>({});
    const autoBonusProgress = ref<Record<string, number>>({});
    const hasAutoBonusCharge = ref<Record<string, boolean>>({});

    let tickerInterval: number | null = null;
    const TICK_RATE_MS = 50;

    function getWorkerInterval(id: string): number {
        const upperId = id.toUpperCase();
        const workerCfg = config.value?.upgrades[upperId];
        if (!workerCfg) return 10000;
        
        const effLevel = getLevel(upperId, 'efficiency');
        const reduction = effLevel * (workerCfg.upgrades.efficiency?.reductionPerLevelMs || 0);
        return Math.max(500, (workerCfg.baseIntervalMs || 10000) - reduction);
    }

    function getWorkerProduction(id: string): number {
        const upperId = id.toUpperCase();
        const workerCfg = config.value?.upgrades[upperId];
        if (!workerCfg) return 0;
        
        const prodLevel = getLevel(upperId, 'production');
        const bonus = prodLevel * (workerCfg.upgrades.production?.increasePerLevel || 0);
        return (workerCfg.baseProduction || 1) + bonus;
    }

    function getLevel(id: string, subType: string = 'main'): number {
        if (!id) return 0;
        const upperId = id.toUpperCase();
        const status = levels.value[upperId];
        if (!status) return 0;
        
        if (subType === 'main') return status.level;
        if (subType === 'efficiency' || subType === 'time') return status.efficiency || 0;
        if (subType === 'production') return status.production || 0;
        return 0;
    }

    function getBoostDuration(id: string): number {
        const upperId = id.toUpperCase();
        const status = levels.value[upperId];
        const upg = config.value?.upgrades[upperId];
        if (!status || !upg?.boosts) return 0;

        const baseDuration = upg.boosts.durationMs;
        const levelBonus = (status.level - 1) * upg.boosts.increaseDurationMs;
        return baseDuration + levelBonus;
    }


    function isBoostActive(id: string): boolean {
        const upperId = id.toUpperCase();
        const status = levels.value[upperId];
        if (!status?.lastBoostAt) return false;
        
        const now = currentTime.value;
        const duration = getBoostDuration(upperId);
        const endTime = status.lastBoostAt + duration;
        return now < endTime;
    }

    function getBuildingInterval(id: string): number {
        const upperId = id.toUpperCase();
        const upg = config.value?.upgrades[upperId];
        if (!upg) return 10000;
        
        const timeLevel = getLevel(upperId, 'time');
        const reduction = timeLevel * (upg.upgrades.time?.reductionPerLevelMs || 0);
        return Math.max(1000, (upg.baseIntervalMs || 10000) - reduction);
    }

    function consumeAndGetTotalBonus(): number {
        if (!config.value) return 0;
        let total = 0;

        Object.keys(config.value.upgrades).forEach(id => {
            const upperId = id.toUpperCase();
            const upg = config.value!.upgrades[id];
            if (!upg || upg.category !== 'BUILDING') return;

            const bonus = upg.bonusValueBonus || 0;
            
            if (isBoostActive(upperId)) {
                total += bonus;
            } 
            else if (hasAutoBonusCharge.value[upperId]) {
                total += bonus;
                hasAutoBonusCharge.value[upperId] = false;
                autoBonusProgress.value[upperId] = 0;
            }
        });

        return total;
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

    const totalBuildingBonus = computed(() => {
        if (!config.value || !config.value.upgrades) return 0;
        let total = 0;
        Object.entries(config.value.upgrades).forEach(([id, upgrade]) => {
            if (upgrade.category?.toUpperCase() === 'BUILDING' && getLevel(id) > 0) {
                total += (upgrade.bonusValueBonus || 0);
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

    async function activateBoost(type: string) {
        if (!authStore.token) return;
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/clicker/boost`, 
                { type: type.toUpperCase() },
                { headers: { Authorization: `Bearer ${authStore.token}` } }
            );
            levels.value = response.data.upgradeLevels;
        } catch (error: any) {
            console.error("Erreur boost", error.response?.data || error.message);
        }
    }

    function startProductionLoop() {
        if (tickerInterval) return;
        
        tickerInterval = window.setInterval(() => {
            currentTime.value = Date.now();
            
            if (!authStore.isAuthenticated || !config.value) return;

            Object.entries(config.value.upgrades).forEach(([id, upg]) => {
                if (upg.category !== 'WORKER') return;

                const upperId = id.toUpperCase();
                const workerCount = getLevel(upperId);
                if (workerCount <= 0) return;

                const interval = getWorkerInterval(upperId);
                const increment = (TICK_RATE_MS / interval) * 100;
                
                const currentProg = cycleProgress.value[upperId] || 0;
                cycleProgress.value[upperId] = currentProg + increment;

                if (cycleProgress.value[upperId] >= 100) {
                    const prodPerUnit = getWorkerProduction(upperId);
                    const totalProduction = workerCount * prodPerUnit;
                    gameStore.addWeight(totalProduction);
                    
                    cycleProgress.value[upperId] = Math.max(0, cycleProgress.value[upperId] - 100);
                }
            });

            Object.entries(config.value.upgrades).forEach(([id, upg]) => {
                const upperId = id.toUpperCase();
                if (upg.category !== 'BUILDING' || getLevel(upperId) <= 0) return;

                if (isBoostActive(upperId)) return;
                if (hasAutoBonusCharge.value[upperId]) return;

                const interval = getBuildingInterval(upperId);
                const increment = (TICK_RATE_MS / interval) * 100;
                
                const current = autoBonusProgress.value[upperId] || 0;
                autoBonusProgress.value[upperId] = Math.min(100, current + increment);

                if (autoBonusProgress.value[upperId] >= 100) {
                    hasAutoBonusCharge.value[upperId] = true;
                }
            });
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
        currentTime,
        cycleProgress,
        autoBonusProgress,
        hasAutoBonusCharge,
        groupedUpgrades,
        totalBuildingBonus,
        getLevel,
        getWorkerInterval,
        getWorkerProduction,
        isBoostActive,
        getBoostDuration,
        getBuildingInterval,
        consumeAndGetTotalBonus,
        fetchConfig,
        fetchState,
        buyUpgrade,
        activateBoost,
        startProductionLoop,
        stopProductionLoop
    };
});
