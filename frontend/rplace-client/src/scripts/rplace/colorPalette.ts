import { computed, onMounted, ref, watch } from 'vue';
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

  const isLocked = (color: string) => {
    if (!lockedColors.includes(color)) return false;
    return !store.ownedColors.includes(color);
  };

  const selectColor = (color: string) => {
    if (isLocked(color)) return;
    store.selectedColor = color;
  };

  const handleColorClick = (color: string) => {
    if (dragDistance.value > 5) return;
    if (isLocked(color)) {
      store.openBuyModal(color);
    } else {
      selectColor(color);
    }
  };

  const scrollContainer = ref<HTMLElement | null>(null);
  const scrollProgress = ref(0);
  const thumbWidth = ref(20);

  // Genere par ia au dessous
  const isDragging = ref(false);
  const startX = ref(0);
  const scrollLeftStart = ref(0);
  const dragDistance = ref(0);

  const startDragging = (e: MouseEvent) => {
    isDragging.value = true;
    dragDistance.value = 0;
    if (!scrollContainer.value) return;

    startX.value = e.pageX - scrollContainer.value.offsetLeft;
    scrollLeftStart.value = scrollContainer.value.scrollLeft;

    window.addEventListener('mousemove', onDragging);
    window.addEventListener('mouseup', stopDragging);

    scrollContainer.value.style.cursor = 'grabbing';
    scrollContainer.value.style.userSelect = 'none';
  };

  const stopDragging = () => {
    if (!isDragging.value) return;
    isDragging.value = false;

    window.removeEventListener('mousemove', onDragging);
    window.removeEventListener('mouseup', stopDragging);

    if (scrollContainer.value) {
      scrollContainer.value.style.cursor = 'grab';
      scrollContainer.value.style.removeProperty('user-select');
    }
  };

  const onDragging = (e: MouseEvent) => {
    if (!isDragging.value || !scrollContainer.value) return;
    e.preventDefault();
    const x = e.pageX - scrollContainer.value.offsetLeft;
    const dist = x - startX.value;
    dragDistance.value = Math.abs(dist);
    const walk = dist * 1.5;
    scrollContainer.value.scrollLeft = scrollLeftStart.value - walk;
  };

  //Genere par ia au dessus

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

  // Fonction généré par IA
  const scrollToSelectedColor = () => {
    if (!scrollContainer.value) return;
    const index = colors.indexOf(store.selectedColor);
    if (index === -1) return;

    const swatchWidth = 44; // 32px + 12px de gap
    const targetScroll = index * swatchWidth;

    scrollContainer.value.scrollTo({
      left: targetScroll - (scrollContainer.value.clientWidth / 2) + (swatchWidth / 2),
      behavior: 'smooth'
    });
  };

  watch(() => store.selectedColor, () => {
    scrollToSelectedColor();
  });

  onMounted(() => {
    if (authStore.isAuthenticated) {
      store.fetchOwnedColors();
    }
    setTimeout(scrollToSelectedColor, 100);
  });

  return {
    colors,
    selectedColor: computed(() => store.selectedColor),
    isAuthenticated: computed(() => authStore.isAuthenticated),
    ownedColors: computed(() => store.ownedColors),
    isLocked,
    selectColor,
    handleColorClick,
    scrollContainer,
    scrollProgress,
    thumbWidth,
    handleScroll,
    startDragging,
    stopDragging,
    onDragging
  };
}
