import { computed, ref, watch } from 'vue';
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
        if (type.toUpperCase() === 'WORKER' && subType === 'efficiency') {
            return upgradeStore.currentIntervalMs <= 1000;
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

    // Si l'onglet actif n'existe plus dans les catégories, on prend la première
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
        const workerCount = upgradeStore.getLevel('WORKER');
        if (workerCount === 0) return "Aucun ouvrier";
        const total = workerCount * upgradeStore.productionPerWorker;
        const seconds = (upgradeStore.currentIntervalMs / 1000).toFixed(1);
        return `+${total} voitures/${seconds}s`;
    });

    const formatName = (name: string): string => {
        const mapping: Record<string, string> = {
            'WORKER': 'Ouvrier',
            'BUILDING': 'Bâtiment',
            'efficiency': 'Efficacité',
            'production': 'Productivité',
            'value': 'Valeur marchande'
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
        if (subType === 'production') return 'Plus de voitures par cycle';
        if (subType === 'value') return 'Augmente le prix de vente';
        return 'Bonus spécial';
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
        getUpgradeDesc
    };
}
