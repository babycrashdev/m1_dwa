/* Aider par l'IA pour structurer et faire fonctionner correctement */
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../auth';
import { useUpgradeStore } from './upgradeStore';
import { useGameStore } from './game';

export interface SlotDTO {
    slotIndex: number;
    unlocked: boolean;
    buildingType: string | null;
    lastBoostAt: number | null;
    lastAutoBonusAt: number | null;
    parcelPresent: boolean;
}

export const useMapStore = defineStore('map', () => {
    const authStore = useAuthStore();

    const slots = ref<SlotDTO[]>([]);
    const loading = ref(false);

    const unlockedSlotsCount = computed(() => slots.value.filter(s => s.unlocked).length);

    function getNextSlotPrice(): number {
        const upgradeStore = useUpgradeStore();
        const config = upgradeStore.config?.global;
        if (!config) return 0;
        const base = config.slotBasePrice || 1000;
        const mult = config.slotPriceMultiplier || 2.5;
        return Math.floor(base * Math.pow(mult, unlockedSlotsCount.value));
    }

    async function fetchMapState() {
        if (!authStore.token || loading.value) return;
        loading.value = true;
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/clicker/map`, {
                headers: { Authorization: `Bearer ${authStore.token}` }
            });
            slots.value = response.data;
            console.log("[MapStore] Slots chargés:", slots.value);
        } catch (error) {
            console.error("Erreur chargement map", error);
        } finally {
            loading.value = false;
        }
    }

    async function unlockNextSlot(slotIndex: number) {
        if (!authStore.token) return;
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/user/clicker/map/unlock`, { slotIndex }, {
                headers: { Authorization: `Bearer ${authStore.token}` }
            });
            await fetchMapState();
            const upgradeStore = useUpgradeStore();
            await upgradeStore.fetchState(); 
        } catch (error) {
            console.error("Erreur unlock slot", error);
        }
    }

    async function placeBuilding(slotIndex: number, buildingType: string) {
        if (!authStore.token) return;
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/user/clicker/map/place`, {
                slotIndex,
                buildingType: buildingType.toUpperCase()
            }, {
                headers: { Authorization: `Bearer ${authStore.token}` }
            });
            await fetchMapState();
        } catch (error) {
            console.error("Erreur placement bâtiment", error);
        }
    }

    async function activateSlotBoost(slotIndex: number, refresh: boolean = true) {
        if (!authStore.token) return;
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/user/clicker/map/boost`, { slotIndex }, {
                headers: { Authorization: `Bearer ${authStore.token}` }
            });
            if (refresh) await fetchMapState();
        } catch (error) {
            console.error("Erreur boost slot", error);
        }
    }

    async function activateAllBoosts() {
        if (!authStore.token) return;
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/user/clicker/map/boost-all`, {}, {
                headers: { Authorization: `Bearer ${authStore.token}` }
            });
            await fetchMapState();
        } catch (error) {
            console.error("Erreur boost all", error);
        }
    }


    async function activateBoostsByType(type: string) {
        if (!authStore.token) return;
        const upperType = type.toUpperCase();

        const upgradeStore = useUpgradeStore();
        const targets = slots.value.filter(s => 
            s.buildingType === upperType && 
            !upgradeStore.isSlotBoostActive(s) && 
            upgradeStore.getSlotBoostCooldown(s) === 0
        );

        for (const slot of targets) {
            await activateSlotBoost(slot.slotIndex, false);
        }
        await fetchMapState();
    }

    async function destroyBuilding(slotIndex: number) {
        if (!authStore.token) return;
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/user/clicker/map/destroy`, { slotIndex }, {
                headers: { Authorization: `Bearer ${authStore.token}` }
            });
            await fetchMapState();
        } catch (error) {
            console.error("Erreur destruction bâtiment", error);
        }
    }

    async function spawnParcel(slotIndex: number) {
        if (!authStore.token) return;
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/clicker/map/parcel-spawned`, { slotIndex }, {
                headers: { Authorization: `Bearer ${authStore.token}` }
            });
            slots.value = response.data;
        } catch (error) {
            console.error("Erreur spawn parcel", error);
        }
    }

    async function collectParcel(slotIndex: number) {
        if (!authStore.token) return;
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/clicker/map/parcel-collected`, { slotIndex }, {
                headers: { Authorization: `Bearer ${authStore.token}` }
            });
            slots.value = response.data;
        } catch (error) {
            console.error("Erreur collect parcel", error);
        }
    }

    return {
        slots,
        loading,
        unlockedSlotsCount,
        getNextSlotPrice,
        fetchMapState,
        unlockNextSlot,
        placeBuilding,
        activateSlotBoost,
        activateAllBoosts,
        activateBoostsByType,
        destroyBuilding,
        spawnParcel,
        collectParcel
    };
});
