import { computed, ref, watch } from 'vue';
import { useUpgradeStore } from '../../stores/clicker/upgradeStore';
import { useGameStore } from '../../stores/clicker/game';
import { useMapStore } from '../../stores/clicker/mapStore';
import type { SlotDTO } from '../../stores/clicker/mapStore';

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
            lv = upgradeStore.getLevel(type);
        } else {
            const sub = upg.upgrades[subType];
            if (!sub) return 0;
            base = sub.basePrice;
            mult = sub.priceMultiplier;
            lv = upgradeStore.getLevel(type, subType);
        }

        return Math.floor(base * Math.pow(mult, lv));
    };

    const isMaxLevel = (type: string, subType: string): boolean => {
        const upperType = type.toUpperCase();
        
        if (subType === 'efficiency') {
            return upgradeStore.getWorkerInterval(upperType) <= 500;
        }

        if (subType === 'time') {
            return upgradeStore.getBuildingInterval(upperType) <= 4000;
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

    const activeTab = ref<string>('WORKER');

    const categories = computed(() => Object.keys(upgradeStore.groupedUpgrades));

    watch(categories, (newCats) => {
        if (newCats.length > 0 && !newCats.includes(activeTab.value)) {
            const firstCat = newCats[0];
            if (firstCat) activeTab.value = firstCat;
        }
    }, { immediate: true });

    const currentUpgrades = computed(() => {
        return upgradeStore.groupedUpgrades[activeTab.value] || [];
    });

    const productionSummary = computed(() => {
        if (!upgradeStore.config) return "Chargement...";
        
        let totalPerSec = 0;
        Object.entries(upgradeStore.config.upgrades).forEach(([id, upg]) => {
            if (upg.category !== 'WORKER') return;
            const count = upgradeStore.getLevel(id);
            if (count <= 0) return;
            
            const prod = upgradeStore.getWorkerProduction(id) * count;
            const interval = upgradeStore.getWorkerInterval(id) / 1000;
            totalPerSec += (prod / interval);
        });

        if (totalPerSec === 0) return "Aucun ouvrier";
        return `+${totalPerSec.toFixed(1)} voitures /s`;
    });

    const formatName = (name: string): string => {
        const mapping: Record<string, string> = {
            'WORKER': 'Ouvrier',
            'BUILDING': 'Bâtiment',
            'efficiency': 'Efficacité',
            'production': 'Productivité',
            'time': 'Vitesse auto-bonus'
        };
        return mapping[name] || name.charAt(0).toUpperCase() + name.slice(1);
    };

    const getIcon = (category: string, id: string): string => {
        if (id === 'WORKER') return '👷';
        if (id === 'BUILDING') return '🏢';
        return '📦';
    };

    const getUpgradeDesc = (id: string, subType: string): string => {
        if (subType === 'main') {
            if (id === 'WORKER') return 'Automatise la production';
            if (id === 'BUILDING') return 'Batiment d\'amelioration de valeur';
            return 'Amélioration de base';
        }
        if (subType === 'efficiency') return 'Réduit le temps de cycle';
        if (subType === 'time') return 'Charge le bonus passif plus vite';
        if (subType === 'production') return 'Plus de voitures par cycle';
        return 'Bonus spécial';
    };

    const getAutoBonusProgress = (id: string): number => {
        return upgradeStore.autoBonusProgress[id.toUpperCase()] || 0;
    };

    const isBoostActive = (id: string): boolean => {
        return upgradeStore.isBoostActive(id);
    };

    const getBoostCooldownRemaining = (id: string): number => {
        return upgradeStore.getBoostCooldownRemaining(id);
    };

    const activateBoost = (id: string) => {
        upgradeStore.activateBoost(id);
    };

    const activateAllBoosts = () => {
        upgradeStore.activateAllBoosts();
    };

    const getPlacedCount = (type: string): number => {
        const mapStore = useMapStore();
        return mapStore.slots.filter((s: SlotDTO) => s.buildingType === type.toUpperCase()).length;
    };

    const getReadyCountByType = (type: string): number => {
        const mapStore = useMapStore();
        return mapStore.slots.filter((s: SlotDTO) => 
            s.buildingType === type.toUpperCase() && 
            !upgradeStore.isSlotBoostActive(s) && 
            upgradeStore.getSlotBoostCooldown(s) === 0
        ).length;
    };

    return {
        upgradeStore,
        activeTab,
        categories,
        currentUpgrades,
        getPrice,
        canAfford,
        isMaxLevel,
        buy,
        productionSummary,
        formatName,
        getIcon,
        getUpgradeDesc,
        getAutoBonusProgress,
        isBoostActive,
        getBoostCooldownRemaining,
        activateBoost,
        activateAllBoosts,
        readyBoostsCount: computed(() => upgradeStore.readyBoostsCount()),
        getPlacedCount,
        getReadyCountByType
    };
}
