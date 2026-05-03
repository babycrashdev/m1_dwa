import { computed, onMounted, ref } from 'vue';
import { useRPlaceStore } from '../../stores/rplace';
import { useAuthStore } from '../../stores/auth';

export function useColorPalette() {
  const store = useRPlaceStore();
  const authStore = useAuthStore();

  const colors = [
    '#FF4500', '#FFA800', '#FFD635', '#00A368',
    '#3690EA', '#FFFFFF', '#811E9F', '#000000',
    '#FFB7CE', '#AEC6CF', '#B2F2BB'
  ];

  const lockedColors = ['#FFB7CE', '#AEC6CF', '#B2F2BB'];

  const showBuyModal = ref(false);
  const colorToBuy = ref('');
  const isBuying = ref(false);
  const errorMessage = ref('');

  const isLocked = (color: string) => {
    if (!lockedColors.includes(color)) return false;
    return !store.ownedColors.includes(color);
  };

  const selectColor = (color: string) => {
    if (isLocked(color)) return;
    store.selectedColor = color;
  };

  const handleColorClick = (color: string) => {
    if (isLocked(color)) {
      colorToBuy.value = color;
      showBuyModal.value = true;
      errorMessage.value = '';
    } else {
      selectColor(color);
    }
  };

  const confirmPurchase = async () => {
    isBuying.value = true;
    errorMessage.value = '';
    try {
      await store.buyColor(colorToBuy.value);
      showBuyModal.value = false;
    } catch (err: any) {
      errorMessage.value = err.message;
    } finally {
      isBuying.value = false;
    }
  };

  const scrollContainer = ref<HTMLElement | null>(null);
  const scrollProgress = ref(0);
  const thumbWidth = ref(20);

  const handleScroll = (e: Event) => {
    const el = e.target as HTMLElement;
    const maxScroll = el.scrollWidth - el.clientWidth;

    if (maxScroll <= 0) {
      scrollProgress.value = 0;
    } else {
      scrollProgress.value = el.scrollLeft / maxScroll;
    }

    if (el.scrollWidth > 0) {
      thumbWidth.value = (el.clientWidth / el.scrollWidth) * 100;
    }
  };

  onMounted(() => {
    if (authStore.isAuthenticated) {
      store.fetchOwnedColors();
    }
  });

  return {
    colors,
    selectedColor: computed(() => store.selectedColor),
    isAuthenticated: computed(() => authStore.isAuthenticated),
    ownedColors: computed(() => store.ownedColors),
    isLocked,
    selectColor,
    handleColorClick,
    confirmPurchase,
    showBuyModal,
    colorToBuy,
    isBuying,
    errorMessage,
    scrollContainer,
    scrollProgress,
    thumbWidth,
    handleScroll
  };
}
