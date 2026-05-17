/* Aider par l'IA pour structurer et faire fonctionner correctement */
import { ref, computed } from 'vue';
import { useMapStore } from '../../stores/clicker/mapStore';
import { useUpgradeStore } from '../../stores/clicker/upgradeStore';
import { useGameStore } from '../../stores/clicker/game';
import { formatNumber } from '../common/formatNumber';
import { formatTime } from '../common/formatTime';

export function useMapSlot(slotIndex: number) {
    const mapStore = useMapStore();
    const upgradeStore = useUpgradeStore();
    const gameStore = useGameStore();

    const showPicker = ref(false);
    const showMenu = ref(false);

    const handleMouseEnter = () => {
    };

    const handleMouseLeave = () => {
    };

    const slotData = computed(() => mapStore.slots.find(s => s.slotIndex === slotIndex));

    const isBoosting = computed(() => {
        if (!slotData.value) return false;
        return upgradeStore.isSlotBoostActive(slotData.value);
    });

    const cooldown = computed(() => {
        if (!slotData.value) return 0;
        return upgradeStore.getSlotBoostCooldown(slotData.value);
    });

    const progressPercent = computed(() => {
        if (!slotData.value || !slotData.value.buildingType) return 0;
        
        if (isBoosting.value) {
            const upg = upgradeStore.config?.upgrades[slotData.value.buildingType];
            if (!upg?.boosts) return 0;
            const duration = upgradeStore.getBoostDuration(slotData.value.buildingType);
            const elapsed = upgradeStore.currentTime - (slotData.value.lastBoostAt || 0);
            return Math.max(0, 100 - (elapsed / duration) * 100);
        }

        return upgradeStore.autoBonusProgress[`slot_${slotIndex}`] || 0;
    });

    const availableBuildings = computed(() => {
        if (!upgradeStore.config) return [];
        return Object.entries(upgradeStore.config.upgrades)
            .filter(([id, u]) => u.category === 'BUILDING' && upgradeStore.getLevel(id) > 0)
            .map(([id, u]) => ({ ...u, id }))
            .sort((a, b) => (a.basePrice || 0) - (b.basePrice || 0));
    });

    function handleClick() {
        if (!slotData.value?.unlocked) {
            if (gameStore.money >= mapStore.getNextSlotPrice()) {
                mapStore.unlockNextSlot(slotIndex);
            }
            return;
        }

        if (slotData.value.buildingType) {
            showMenu.value = true;
        } else {
            showPicker.value = true;
        }
    }


    async function placeBuilding(type: string) {
        await mapStore.placeBuilding(slotIndex, type);
        showPicker.value = false;
    }

    async function boost() {
        if (isBoosting.value || cooldown.value > 0) return;
        await mapStore.activateSlotBoost(slotIndex);
        showMenu.value = false;
    }

    function destroy() {
        mapStore.destroyBuilding(slotIndex);
        showMenu.value = false;
    }

    function getIcon(type: string) {
        const mapping: any = { 
            'GARAGE': '🚗', 
            'ENTREPOT': '📦',
            'CARROSSIER': '🎨', 
            'FACTORY': '🏭',
            'CONCESSION': '🏢', 
            'AFFAIRES': '🏙️',
            'EXPEDITION': '🚀'
        };
        return mapping[type.toUpperCase()] || '🏭';
    }

    function getSpriteUrl(type: string) {
        const upg = upgradeStore.config?.upgrades[type.toUpperCase()];
        const spriteName = upg?.sprite || 'default.png';
        return new URL(`../../assets/building/${spriteName}`, import.meta.url).href;
    }

    return {
        mapStore,
        upgradeStore,
        gameStore,
        showPicker,
        showMenu,
        handleMouseEnter,
        handleMouseLeave,
        slotData,
        isBoosting,
        cooldown,
        progressPercent,
        availableBuildings,
        handleClick,
        placeBuilding,
        boost,
        destroy,
        formatNumber,
        formatTime,
        getIcon,
        getSpriteUrl
    };
}
