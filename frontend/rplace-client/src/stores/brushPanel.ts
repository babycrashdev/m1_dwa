import { defineStore, storeToRefs } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';
import { useRPlaceStore } from './rplace';
import { useAuthStore } from './auth';
import { useGameStore } from './game';

export const useBrushPanelStore = defineStore('brushPanel', () => {
  const rplaceStore = useRPlaceStore();
  const authStore = useAuthStore();
  const gameStore = useGameStore();

  const { pixels, gridSize, initialPrice, stompClient, cooldownSeconds } = storeToRefs(rplaceStore);

  const isBrushActive = ref(false);
  const brushSize = ref(0);
  const ownedBrushes = ref<string[]>([]);

  const showBuyModal = ref(false);
  const brushToBuy = ref('');
  const isBuying = ref(false);
  const errorMessage = ref('');

  const prices: Record<string, number> = {
    "3x3": 500,
    "5x5": 1000,
    "7x7": 2500,
    "9x9": 5000
  };

  const brushTotalPrice = computed(() => {
    if (!isBrushActive.value || rplaceStore.hoveredPixel.x === -1 || gridSize.value === 0) return 0;

    let total = 0;
    const offset = Math.floor(brushSize.value / 2);
    const cx = Math.max(offset, Math.min(rplaceStore.hoveredPixel.x, gridSize.value - 1 - offset));
    const cy = Math.max(offset, Math.min(rplaceStore.hoveredPixel.y, gridSize.value - 1 - offset));

    for (let dy = -offset; dy <= offset; dy++) {
      for (let dx = -offset; dx <= offset; dx++) {
        const nx = cx + dx;
        const ny = cy + dy;
        const index = ny * gridSize.value + nx;
        total += pixels.value[index]?.price || initialPrice.value;
      }
    }
    return total;
  });

  const isLocked = (size: string) => {
    return !ownedBrushes.value.includes(size);
  };

  const handleBrushClick = (size: number) => {
    const sizeStr = `${size}x${size}`;
    if (isLocked(sizeStr)) {
      brushToBuy.value = sizeStr;
      showBuyModal.value = true;
      errorMessage.value = '';
    } else {
      brushSize.value = size;
    }
  };

  const confirmPurchase = async () => {
    isBuying.value = true;
    errorMessage.value = '';
    try {
      await buyBrush(brushToBuy.value);
      showBuyModal.value = false;
      brushSize.value = parseInt(brushToBuy.value.split('x')[0]);
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
      console.log(`[Brush] Tentative d'achat de ${upgrade}...`);
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/user/rplace/brushes/buy`,
        { upgrade },
        { headers: { Authorization: `Bearer ${authStore.token}` } }
      );
      console.log(`[Brush] Achat réussi pour ${upgrade}`, response.data);
      ownedBrushes.value.push(upgrade);
      gameStore.money -= prices[upgrade] || 0;
      return true;
    } catch (error: any) {
      console.error(`[Brush] Échec de l'achat pour ${upgrade}`, error);
      throw new Error(error.response?.data?.message || "Erreur lors de l'achat");
    }
  }

  function placeBrushPixels(cx: number, cy: number) {
    if (cooldownSeconds.value > 0) {
      throw new Error(`Cooldown actif: encore ${cooldownSeconds.value}s`);
    }

    if (!stompClient.value || !stompClient.value.connected) {
      throw new Error("WebSocket non connecté");
    }

    const totalCost = brushTotalPrice.value;
    if (gameStore.money < totalCost) {
      throw new Error(`Solde insuffisant ! Besoin de ${totalCost} moneys.`);
    }

    const pixelsToPlace = [];
    const offset = Math.floor(brushSize.value / 2);

    for (let dy = -offset; dy <= offset; dy++) {
      for (let dx = -offset; dx <= offset; dx++) {
        const nx = cx + dx;
        const ny = cy + dy;
        if (nx >= 0 && nx < gridSize.value && ny >= 0 && ny < gridSize.value) {
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
    ownedBrushes,
    showBuyModal,
    brushToBuy,
    isBuying,
    errorMessage,
    prices,
    brushTotalPrice,
    isLocked,
    handleBrushClick,
    confirmPurchase,
    fetchOwnedBrushes,
    buyBrush,
    placeBrushPixels
  };
});
