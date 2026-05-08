
import { useLoadingStore } from '../../stores/common/loadingStore';
import { storeToRefs } from 'pinia';

export function useLoadingScreen() {
    const loadingStore = useLoadingStore();
    const { isLoading, currentTip } = storeToRefs(loadingStore);

    return {
        isLoading,
        currentTip,
        nextTip: loadingStore.nextTip,
        prevTip: loadingStore.prevTip
    };
}
