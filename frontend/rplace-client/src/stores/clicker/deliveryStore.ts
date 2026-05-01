import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useGameStore } from './game';
import { useUpgradeStore } from './upgradeStore';

export interface Delivery {
    id: number;
    weight: number;
    value: number;
    startTime: number;
}

export const useDeliveryStore = defineStore('delivery', () => {
    const gameStore = useGameStore();
    const upgradeStore = useUpgradeStore();
    
    const activeDeliveries = ref<Delivery[]>([]);

    function startDelivery(weight: number) {
        if (weight <= 0) return;

        const baseValue = upgradeStore.config?.global.baseCarValue || 10;
        const dynamicBonus = upgradeStore.consumeAndGetTotalBonus();
        const totalValue = weight * (baseValue + dynamicBonus);
        const id = Date.now() + Math.random();

        const newDelivery: Delivery = {
            id,
            weight,
            value: totalValue,
            startTime: Date.now()
        };

        activeDeliveries.value.push(newDelivery);
        console.log(`[Clicker] Drone lance poids: ${newDelivery.weight}`);

        setTimeout(() => {
            completeDelivery(id);
        }, 10000);
    }

    function completeDelivery(id: number) {
        const index = activeDeliveries.value.findIndex(d => d.id === id);
        if (index !== -1) {
            const delivery = activeDeliveries.value[index];
            if (!delivery) return;

            gameStore.money += delivery.value;
            gameStore.pendingSync += delivery.value;
            gameStore.syncToBackend();

            activeDeliveries.value.splice(index, 1);
            console.log(`[Clicker] Chemin fini: ✨ ${delivery.value} crédités`);
        }
    }

    return {
        activeDeliveries,
        startDelivery,
        completeDelivery
    };
});
