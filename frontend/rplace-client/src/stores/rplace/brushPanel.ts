import { defineStore, storeToRefs } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';
import { useRPlaceStore } from '../rplace';
import { useAuthStore } from '../auth';
import { useGameStore } from '../clicker/game';

export const useBrushPanelStore = defineStore('brushPanel', () => {
  const rplaceStore = useRPlaceStore();
  const authStore = useAuthStore();
  const gameStore = useGameStore();

  const { pixels, gridSize, initialPrice, stompClient, cooldownSeconds } = storeToRefs(rplaceStore);

  const isBrushActive = ref(false);
  const brushSize = ref(0);
  const brushShape = ref<'square' | 'circle'>('square');
  const ownedBrushes = ref<string[]>([]);

  const showBuyModal = ref(false);
  const brushToBuy = ref('');
  const isBuying = ref(false);
  const errorMessage = ref('');

  const prices: Record<string, number> = {
    "3x3": 500,
    "5x5": 1000,
    "7x7": 2500,
    "9x9": 5000,
    "C3x": 500,
    "C5x": 1000,
    "C7x": 2500,
    "C9x": 5000
  };

  const isPixelInBrush = (dx: number, dy: number, size: number) => {
    if (brushShape.value === 'square') return true;
    const radius = (size - 1) / 2;
    // Dynamic threshold: fuller circles for larger sizes
    return (dx * dx + dy * dy) <= (radius * radius) + (radius * 0.8);
  };

  const brushTotalPrice = computed(() => {
    if (!isBrushActive.value || rplaceStore.hoveredPixel.x === -1 || gridSize.value === 0 || brushSize.value === 0) return 0;

    let total = 0;
    const offset = Math.floor(brushSize.value / 2);
    const cx = rplaceStore.hoveredPixel.x;
    const cy = Math.max(offset, Math.min(rplaceStore.hoveredPixel.y, gridSize.value - 1 - offset));

    for (let dy = -offset; dy <= offset; dy++) {
      for (let dx = -offset; dx <= offset; dx++) {
        if (!isPixelInBrush(dx, dy, brushSize.value)) continue;

        const nx = ((cx + dx) % gridSize.value + gridSize.value) % gridSize.value;
        const ny = cy + dy;
        
        if (ny >= 0 && ny < gridSize.value) {
          const index = ny * gridSize.value + nx;
          total += pixels.value[index]?.price || initialPrice.value;
        }
      }
    }
    return total;
  });

  const isLocked = (size: number) => {
    const id = brushShape.value === 'square' ? `${size}x${size}` : `C${size}x`;
    return !ownedBrushes.value.includes(id);
  };

  const handleBrushClick = (size: number) => {
    const id = brushShape.value === 'square' ? `${size}x${size}` : `C${size}x`;
    if (isLocked(size)) {
      brushToBuy.value = id;
      showBuyModal.value = true;
      errorMessage.value = '';
    } else {
      brushSize.value = size;
    }
  };

  const toggleBrush = (shape: 'square' | 'circle') => {
    if (isBrushActive.value && brushShape.value === shape) {
      isBrushActive.value = false;
      brushSize.value = 0;
    } else {
      isBrushActive.value = true;
      brushShape.value = shape;
      brushSize.value = 0;
    }
  };

  const confirmPurchase = async () => {
    isBuying.value = true;
    errorMessage.value = '';
    try {
      await buyBrush(brushToBuy.value);
      showBuyModal.value = false;
      // Extract size from ID (handles both "3x3" and "C3x")
      const sizeStr = brushToBuy.value.startsWith('C') 
        ? brushToBuy.value.charAt(1) 
        : brushToBuy.value.split('x')[0];
      brushSize.value = parseInt(sizeStr || '0');
    } catch (err: any) {
      errorMessage.value = err.message;
    } finally {
      isBuying.value = false;
    }
  };

  async function fetchOwnedBrushes() {
    if (!authStore.isAuthenticated) return;
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/rplace/brushes/owned`, {
        headers: { Authorization: `Bearer ${authStore.token}` }
      });
      ownedBrushes.value = response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des pinceaux possédés', error);
    }
  }

  async function buyBrush(upgrade: string) {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/rplace/brushes/buy`,
        { upgrade },
        { headers: { Authorization: `Bearer ${authStore.token}` } }
      );
      ownedBrushes.value.push(upgrade);
      gameStore.money -= prices[upgrade] || 0;
      return true;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Erreur lors de l'achat");
    }
  }

  function placeBrushPixels(cx: number, cy: number) {
    if (cooldownSeconds.value > 0) throw new Error(`Cooldown actif: encore ${cooldownSeconds.value}s`);
    if (!stompClient.value?.connected) throw new Error("WebSocket non connecté");

    const totalCost = brushTotalPrice.value;
    if (gameStore.money < totalCost) throw new Error(`Solde insuffisant ! Besoin de ${totalCost} moneys.`);

    const pixelsToPlace = [];
    const offset = Math.floor(brushSize.value / 2);

    for (let dy = -offset; dy <= offset; dy++) {
      for (let dx = -offset; dx <= offset; dx++) {
        if (!isPixelInBrush(dx, dy, brushSize.value)) continue;

        const nx = ((cx + dx) % gridSize.value + gridSize.value) % gridSize.value;
        const ny = cy + dy;
        if (ny >= 0 && ny < gridSize.value) {
          pixelsToPlace.push({ x: nx, y: ny, color: rplaceStore.selectedColor });
        }
      }
    }

    stompClient.value.publish({
      destination: '/app/place-brush',
      body: JSON.stringify(pixelsToPlace)
    });
    rplaceStore.startCooldown(5);
  }

  return {
    isBrushActive,
    brushSize,
    brushShape,
    ownedBrushes,
    showBuyModal,
    brushToBuy,
    isBuying,
    errorMessage,
    prices,
    brushTotalPrice,
    isLocked,
    handleBrushClick,
    toggleBrush,
    confirmPurchase,
    fetchOwnedBrushes,
    buyBrush,
    placeBrushPixels
  };
});
