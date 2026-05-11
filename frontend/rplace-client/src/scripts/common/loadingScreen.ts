
import { useLoadingStore } from '../../stores/common/loadingStore';
import { useServerStore } from '../../stores/common/serverStore';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';

export function useLoadingScreen() {
    const loadingStore = useLoadingStore();
    const serverStore = useServerStore();
    const { isLoading: storeLoading, currentTip } = storeToRefs(loadingStore);
    const { isOnline } = storeToRefs(serverStore);

    const isLoading = computed(() => storeLoading.value || !isOnline.value);

    return {
        isLoading,
        isOnline,
        currentTip,
        nextTip: loadingStore.nextTip,
        prevTip: loadingStore.prevTip
    };
}
