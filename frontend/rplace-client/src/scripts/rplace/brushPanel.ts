import { onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useBrushPanelStore } from '@/stores/rplace/brushPanel';
import { storeToRefs } from 'pinia';

export function useBrushPanel() {
  const authStore = useAuthStore();
  const brushStore = useBrushPanelStore();
  
  const { 
    isBrushActive, 
    brushTotalPrice, 
    brushSize, 
    brushShape,
    ownedBrushes,
    showBuyModal,
    brushToBuy,
    isBuying,
    errorMessage
  } = storeToRefs(brushStore);

  const { handleBrushClick, handleShapeChange, confirmPurchase, isLocked, prices } = brushStore;

  onMounted(() => {
    if (authStore.isAuthenticated) {
      brushStore.fetchOwnedBrushes();
    }
  });

  const brushToBuySizeNum = computed(() => {
    const val = brushToBuy.value;
    if (!val) return 3;
    const cleanVal = val.replace('C', '');
    const firstPart = cleanVal.split('x')[0];
    if (firstPart === undefined) return 3;
    return parseInt(firstPart) || 3;
  });

  const brushToBuyPrice = computed(() => {
    const val = brushToBuy.value;
    if (!val) return 0;
    return prices[val] ?? 0;
  });

  return {
    isBrushActive,
    brushTotalPrice,
    brushSize,
    brushShape,
    ownedBrushes,
    showBuyModal,
    brushToBuy,
    isBuying,
    errorMessage,
    prices,
    handleBrushClick,
    handleShapeChange,
    confirmPurchase,
    isLocked,
    brushToBuySizeNum,
    brushToBuyPrice
  };
}
