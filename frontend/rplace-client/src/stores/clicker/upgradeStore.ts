import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../auth';
import { useGameStore } from './game';
import { useDeliveryStore } from './deliveryStore';
import { useMapStore, type SlotDTO } from './mapStore';

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
    global: { 
        syncIntervalMs: number; 
        baseCarValue: number;
        maxSlots?: number;
        slotBasePrice?: number;
        slotPriceMultiplier?: number;
        firstSlotFree?: boolean;
    };
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
        const mapStore = useMapStore();
        return mapStore.slots.some(s => s.buildingType === id.toUpperCase() && isSlotBoostActive(s));
    }

    function isSlotBoostActive(slot: SlotDTO): boolean {
        if (!slot.lastBoostAt || !slot.buildingType) return false;
        const upg = config.value?.upgrades[slot.buildingType];
        if (!upg?.boosts) return false;

        const now = currentTime.value;
        const duration = getBoostDuration(slot.buildingType);
        return now < (slot.lastBoostAt + duration);
    }

    function hasSlotAutoBonusCharge(slot: SlotDTO): boolean {
        return hasAutoBonusCharge.value[`slot_${slot.slotIndex}`] || false;
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
        const mapStore = useMapStore();
        if (!config.value || !mapStore.slots) return 0;
        let total = 0;

        mapStore.slots.forEach(slot => {
            if (!slot.buildingType) return;
            
            const upg = config.value!.upgrades[slot.buildingType];
            if (!upg) return;

            const bonus = upg.bonusValueBonus || 0;
            
            if (isSlotBoostActive(slot)) {
                total += bonus;
            } 
            else if (hasSlotAutoBonusCharge(slot)) {
                total += bonus;
                slot.lastAutoBonusAt = Date.now();
                hasAutoBonusCharge.value[`slot_${slot.slotIndex}`] = false;
                autoBonusProgress.value[`slot_${slot.slotIndex}`] = 0;
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

    function getTotalBuildingBonus(): number {
        const mapStore = useMapStore();
        if (!config.value || !mapStore.slots) return 0;
        let total = 0;
        mapStore.slots.forEach(slot => {
            if (slot.buildingType && getLevel(slot.buildingType) > 0) {
                const upg = config.value!.upgrades[slot.buildingType];
                if (upg) total += (upg.bonusValueBonus || 0);
            }
        });
        return total;
    }

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
        const mapStore = useMapStore();
        await mapStore.activateBoostsByType(type);
    }

    async function activateAllBoosts() {
        const mapStore = useMapStore();
        await mapStore.activateAllBoosts();
    }

    function getBoostCooldownRemaining(id: string): number {
        const mapStore = useMapStore();
        const relevantSlots = mapStore.slots.filter(s => s.buildingType === id.toUpperCase());
        if (relevantSlots.length === 0) return 0;
        
        const cooldowns = relevantSlots.map(s => getSlotBoostCooldown(s));
        return Math.min(...cooldowns);
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

            const mapStore = useMapStore();
            mapStore.slots.forEach(slot => {
                if (!slot.buildingType || getLevel(slot.buildingType) <= 0) return;

                const slotKey = `slot_${slot.slotIndex}`;
                if (isSlotBoostActive(slot)) return;
                if (hasSlotAutoBonusCharge(slot)) return;

                const interval = getBuildingInterval(slot.buildingType);
                const increment = (TICK_RATE_MS / interval) * 100;
                
                const current = autoBonusProgress.value[slotKey] || 0;
                autoBonusProgress.value[slotKey] = Math.min(100, current + increment);

                if (autoBonusProgress.value[slotKey] >= 100) {
                    hasAutoBonusCharge.value[slotKey] = true;
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

    function getReadyBoostsCount(): number {
        const mapStore = useMapStore();
        return mapStore.slots.filter(slot => {
            if (!slot.buildingType) return false;
            return !isSlotBoostActive(slot) && getSlotBoostCooldown(slot) === 0;
        }).length;
    }

    function getSlotBoostCooldown(slot: SlotDTO): number {
        if (!slot.lastBoostAt || !slot.buildingType) return 0;
        const upg = config.value?.upgrades[slot.buildingType];
        if (!upg?.boosts) return 0;

        const now = currentTime.value;
        const duration = getBoostDuration(slot.buildingType);
        const nextAvailable = slot.lastBoostAt + duration + upg.boosts.cooldownMs;
        return Math.max(0, nextAvailable - now);
    }

    return {
        config,
        levels,
        currentTime,
        cycleProgress,
        autoBonusProgress,
        hasAutoBonusCharge,
        groupedUpgrades,
        totalBuildingBonus: getTotalBuildingBonus,
        readyBoostsCount: getReadyBoostsCount,
        getLevel,
        getWorkerInterval,
        getWorkerProduction,
        isBoostActive,
        isSlotBoostActive,
        getBoostDuration,
        getBuildingInterval,
        getBoostCooldownRemaining,
        getSlotBoostCooldown,
        consumeAndGetTotalBonus,
        fetchConfig,
        fetchState,
        buyUpgrade,
        activateBoost,
        activateAllBoosts,
        startProductionLoop,
        stopProductionLoop
    };
});
