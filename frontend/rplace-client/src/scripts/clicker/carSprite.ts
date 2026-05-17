import { computed, onMounted, ref } from 'vue';
import { CITY_SVG_PATH, SLOT_PATH_PROGRESS } from './mapConfig';
import { useMapStore } from '../../stores/clicker/mapStore';
import { useUpgradeStore } from '../../stores/clicker/upgradeStore';
import { useGameStore } from '../../stores/clicker/game';
import { useDeliveryStore } from '../../stores/clicker/deliveryStore';
import { formatNumber } from '../common/formatNumber';

interface DeliveryProp {
    id: number;
    weight: number;
    startTime: number;
}

/* Aider par l'IA pour structurer et faire fonctionner correctement */
export function useCarSprite(delivery: DeliveryProp) {
    const mapStore = useMapStore();
    const upgradeStore = useUpgradeStore();
    const gameStore = useGameStore();
    const deliveryStore = useDeliveryStore();

    const DURATION_MS = 10000;
    const offsetDistance = ref('0%');
    const droneScale = ref(1);
    
    interface CollectedParcel {
        slotIndex: number;
        collectedAt: number;
        initialProgress: number;
    }
    const collectedParcels = ref<CollectedParcel[]>([]);

    onMounted(() => {
        const animate = () => {
            const elapsed = Date.now() - delivery.startTime;
            const progress = Math.min((elapsed / DURATION_MS) * 100, 100);
            offsetDistance.value = `${progress}%`;

            if (progress > 92) {
                droneScale.value = Math.max(0, (100 - progress) / 8);
            } else if (progress < 8) {
                droneScale.value = Math.min(1, progress / 8);
            } else {
                droneScale.value = 1;
            }

            mapStore.slots.forEach(slot => {
                const isAlreadyCollected = collectedParcels.value.some(p => p.slotIndex === slot.slotIndex);
                if (slot.parcelPresent && !isAlreadyCollected) {
                    const slotPos = SLOT_PATH_PROGRESS[slot.slotIndex];
                    if (slotPos !== undefined && progress >= slotPos && progress <= slotPos + 2) {
                        collectedParcels.value.push({
                            slotIndex: slot.slotIndex,
                            collectedAt: Date.now(),
                            initialProgress: slotPos
                        });
                        
                        mapStore.collectParcel(slot.slotIndex);
                        
                        if (slot.buildingType) {
                            const upg = upgradeStore.config?.upgrades[slot.buildingType];
                            if (upg) {
                                deliveryStore.addParcelToDelivery(delivery.id, upg.bonusValueBonus || 0);
                            }
                        }
                    }
                }
            });

            if (progress < 100) {
                requestAnimationFrame(animate);
            }
        };
        animate();
    });

    const spriteStyle = computed(() => ({
        offsetPath: `path('${CITY_SVG_PATH}')`,
        offsetDistance: offsetDistance.value,
        offsetRotate: '0deg'
    }));

    const droneTransformStyle = computed(() => ({
        transform: `scale(${droneScale.value})`,
        transition: 'transform 0.1s ease-out'
    }));

    const getParcelStyle = (index: number) => {
        const parcel = collectedParcels.value[index];
        if (!parcel) return {};

        const elapsed = Date.now() - parcel.collectedAt;
        const animProgress = Math.min(elapsed / 400, 1);
        
        const droneDist = parseFloat(offsetDistance.value);
        const targetDist = Math.max(0, droneDist - ((index + 1) * 3));

        const currentDist = parcel.initialProgress + (targetDist - parcel.initialProgress) * animProgress;
        
        const scale = 1.3 - (0.3 * animProgress); 
        const opacity = animProgress < 0.2 ? animProgress * 5 : 1;

        return {
            offsetPath: `path('${CITY_SVG_PATH}')`,
            offsetDistance: `${currentDist}%`,
            offsetRotate: '0deg',
            transform: `scale(${scale})`,
            opacity: opacity * droneScale.value,
            zIndex: 100 - index
        };
    };

    return {
        droneScale,
        collectedParcels,
        spriteStyle,
        droneTransformStyle,
        getParcelStyle,
        formatNumber
    };
}
