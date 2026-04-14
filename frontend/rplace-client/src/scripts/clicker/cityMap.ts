import { ref } from 'vue';

export function useCityMap() {
    const roadSlots = ref([9, 10, 11, 12, 13, 14, 15, 16, 24, 23, 22, 21, 20, 19, 18, 17]);
    
    const isRoad = (index: number) => {
        return roadSlots.value.includes(index);
    };

    return {
        isRoad
    };
}
