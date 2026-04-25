import { computed } from 'vue';
import { useUpgradeStore } from '../../stores/clicker/upgradeStore';
import { useGameStore } from '../../stores/clicker/game';

export function useUpgradePanel() {
    const upgradeStore = useUpgradeStore();
    const gameStore = useGameStore();

    const getPrice = (type: string, subType: string = 'main'): number => {
        if (!upgradeStore.config) return 0;
        const upg = upgradeStore.config.upgrades[type.toUpperCase()];
        if (!upg) return 0;

        let base, mult, lv;
        if (subType === 'main') {
            base = upg.basePrice;
            mult = upg.priceMultiplier;
            lv = upgradeStore.levels.workerCount;
        } else {
            const sub = upg.upgrades[subType];
            if (!sub) return 0;
            base = sub.basePrice;
            mult = sub.priceMultiplier;
            lv = subType === 'efficiency' ? upgradeStore.levels.efficiencyLevel : upgradeStore.levels.productionLevel;
        }

        return Math.floor(base * Math.pow(mult, lv));
    };

    const isMaxLevel = (type: string, subType: string): boolean => {
        if (type.toUpperCase() === 'WORKER' && subType === 'efficiency') {
            return currentIntervalMs.value <= 1000;
        }
        return false;
    };

    const canAfford = (type: string, subType: string = 'main'): boolean => {
        if (isMaxLevel(type, subType)) return false;
        return gameStore.money >= getPrice(type, subType);
    };

    const buy = (type: string, subType: string = 'main') => {
        if (canAfford(type, subType) && !isMaxLevel(type, subType)) {
            upgradeStore.buyUpgrade(type, subType);
        }
    };

    const productionPerWorker = computed(() => {
        if (!upgradeStore.config) return 0;
        const workerCfg = upgradeStore.config.upgrades.WORKER;
        if (!workerCfg) return 0;
        // baseProduction + (level * increasePerLevel)
        const bonus = upgradeStore.levels.productionLevel * (workerCfg.upgrades.production?.increasePerLevel || 0);
        return (workerCfg.baseProduction || 1) + bonus;
    });

    const currentIntervalMs = computed(() => {
        if (!upgradeStore.config) return 10000;
        const workerCfg = upgradeStore.config.upgrades.WORKER;
        if (!workerCfg) return 10000;
        // baseInterval - (level * reduction)
        const reduction = upgradeStore.levels.efficiencyLevel * (workerCfg.upgrades.efficiency?.reductionPerLevelMs || 0);
        return Math.max(1000, (workerCfg.baseIntervalMs || 10000) - reduction);
    });

    const productionSummary = computed(() => {
        if (upgradeStore.levels.workerCount === 0) return "Aucun ouvrier";
        const total = upgradeStore.levels.workerCount * productionPerWorker.value;
        const seconds = (currentIntervalMs.value / 1000).toFixed(1);
        return `+${total} voitures/${seconds}s`;
    });

    return {
        upgradeStore,
        getPrice,
        canAfford,
        isMaxLevel,
        buy,
        productionPerWorker,
        currentIntervalMs,
        productionSummary
    };
}
