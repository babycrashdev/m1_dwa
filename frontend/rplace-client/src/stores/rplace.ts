import { defineStore } from 'pinia';
import { Client } from '@stomp/stompjs';
import axios from 'axios';
import { useAuthStore } from './auth';
import { useGameStore } from './game';

export interface PixelData {
  x: number;
  y: number;
  color: string;
  price: number;
  ownerName?: string;
  lastModifiedAt?: string;
}

export const useRPlaceStore = defineStore('rplace', {
  state: () => ({
    pixels: [] as PixelData[],
    ownedColors: [] as string[],
    ownedBrushes: [] as string[],
    gridSize: 0,
    selectedColor: '#FF4500',
    cooldownSeconds: 0,
    stompClient: null as Client | null,
    isInitialLoaded: false,
    initialPrice: 10,
    isBrushActive: false,
    brushSize: 0,
    hoveredPixel: { x: -1, y: -1 }
  }),
  getters: {
    hoveredPixelData: (state) => {
      if (state.hoveredPixel.x === -1 || state.gridSize === 0) return null;
      const index = state.hoveredPixel.y * state.gridSize + state.hoveredPixel.x;
      return state.pixels[index] || null;
    },
    brushTotalPrice: (state) => {
      if (!state.isBrushActive || state.hoveredPixel.x === -1 || state.gridSize === 0) return 0;
      
      let total = 0;
      const offset = Math.floor(state.brushSize / 2);
      const cx = Math.max(offset, Math.min(state.hoveredPixel.x, state.gridSize - 1 - offset));
      const cy = Math.max(offset, Math.min(state.hoveredPixel.y, state.gridSize - 1 - offset));

      for (let dy = -offset; dy <= offset; dy++) {
        for (let dx = -offset; dx <= offset; dx++) {
          const nx = cx + dx;
          const ny = cy + dy;
          const index = ny * state.gridSize + nx;
          total += state.pixels[index]?.price || state.initialPrice;
        }
      }
      return total;
    }
  },
  actions: {
    async fetchConfig() {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/config/rplace`);
        this.gridSize = response.data.gridSize;
        this.pixels = Array.from({ length: this.gridSize * this.gridSize }, (_, i) => ({
          x: i % this.gridSize,
          y: Math.floor(i / this.gridSize),
          color: '#FFFFFF',
          price: this.initialPrice
        }));
        console.log(`Configuration récupérée : Grille de ${this.gridSize}x${this.gridSize}`);
      } catch (error) {
        console.error('Impossible de récupérer la config r/place', error);
        this.gridSize = 100;
        this.pixels = Array.from({ length: 100 * 100 }, (_, i) => ({
          x: i % 100,
          y: Math.floor(i / 100),
          color: '#FFFFFF',
          price: 10
        }));
      }
    },

    async fetchInitialBoard() {
      if (this.gridSize === 0) await this.fetchConfig();

      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/pixels`);
        if (Array.isArray(response.data)) {
          response.data.forEach((pixel: any) => {
            const index = pixel.y * this.gridSize + pixel.x;
            if (index < this.pixels.length) {
              this.pixels[index] = {
                x: pixel.x,
                y: pixel.y,
                color: pixel.color,
                price: pixel.price > 0 ? pixel.price : this.initialPrice,
                ownerName: pixel.ownerName,
                lastModifiedAt: pixel.lastModifiedAt
              };
            }
          });
          this.isInitialLoaded = true;
        }
      } catch (error) {
        console.error('Initialisation de la map échouée', error);
      }
    },

    connectWebSocket() {
      const authStore = useAuthStore();
      if (this.stompClient) return;

      const connectHeaders: Record<string, string> = {};
      if (authStore.token) {
        connectHeaders['Authorization'] = `Bearer ${authStore.token}`;
      }

      this.stompClient = new Client({
        brokerURL: import.meta.env.VITE_WS_URL,
        connectHeaders: connectHeaders,
        onConnect: () => {
          console.log(authStore.token ? 'Connecté au WebSocket (Authentifié)' : 'Connecté au WebSocket (Anonyme)');
          this.stompClient?.subscribe('/topic/board', (message) => {
            const pixelData = JSON.parse(message.body);
            this.updatePixelFromWS(pixelData);
          });
        },
        onStompError: (frame) => {
          console.error('Erreur STOMP', frame);
        }
      });

      this.stompClient.activate();
    },

    disconnectWebSocket() {
      if (this.stompClient) {
        this.stompClient.deactivate();
        this.stompClient = null;
        console.log('WebSocket déconnecté');
      }
    },

    updatePixelFromWS(pixelData: PixelData) {
      const authStore = useAuthStore();
      const gameStore = useGameStore();
      const index = pixelData.y * this.gridSize + pixelData.x;

      if (pixelData.ownerName === authStore.user?.username) {
        const oldPixel = this.pixels[index];
        const pricePaid = oldPixel ? oldPixel.price : 10;
        gameStore.money -= pricePaid;
        console.log(`Déduction locale : -${pricePaid} moneys. Nouveau solde : ${gameStore.money}`);
      }

      this.pixels[index] = pixelData;
    },

    placePixel(x: number, y: number) {
      const gameStore = useGameStore();
      const index = y * this.gridSize + x;
      const pixel = this.pixels[index];

      // TODO : afficher un message à l'utilisateur
      if (this.cooldownSeconds > 0) {
        throw new Error(`Cooldown actif: encore ${this.cooldownSeconds}s`);
      }

      if (pixel && gameStore.money < pixel.price) {
        throw new Error("Solde insuffisant !");
      }

      if (!this.stompClient || !this.stompClient.connected) {
        throw new Error("WebSocket non connecté");
      }

      const payload = { x, y, color: this.selectedColor };
      this.stompClient.publish({
        destination: '/app/place',
        body: JSON.stringify(payload)
      });

      this.startCooldown(5);
    },

    placeBrushPixels(cx: number, cy: number) {
      const gameStore = useGameStore();

      if (this.cooldownSeconds > 0) {
        throw new Error(`Cooldown actif: encore ${this.cooldownSeconds}s`);
      }

      if (!this.stompClient || !this.stompClient.connected) {
        throw new Error("WebSocket non connecté");
      }

      let totalCost = 0;
      const pixelsToPlace = [];
      const offset = Math.floor(this.brushSize / 2);

      for (let dy = -offset; dy <= offset; dy++) {
        for (let dx = -offset; dx <= offset; dx++) {
          const nx = cx + dx;
          const ny = cy + dy;
          if (nx >= 0 && nx < this.gridSize && ny >= 0 && ny < this.gridSize) {
            const index = ny * this.gridSize + nx;
            const pixel = this.pixels[index];
            totalCost += pixel ? pixel.price : this.initialPrice;
            pixelsToPlace.push({ x: nx, y: ny });
          }
        }
      }

      if (gameStore.money < totalCost) {
        throw new Error(`Solde insuffisant ! Besoin de ${totalCost} moneys.`);
      }

      this.stompClient?.publish({
        destination: '/app/place-brush',
        body: JSON.stringify(pixelsToPlace.map(p => ({ x: p.x, y: p.y, color: this.selectedColor })))
      });

      console.log(`[Brush ${this.brushSize}x${this.brushSize}] Placement de ${pixelsToPlace.length} pixels.`);
      this.startCooldown(5);
    },

    startCooldown(seconds: number) {
      this.cooldownSeconds = seconds;
      const timer = setInterval(() => {
        this.cooldownSeconds--;
        if (this.cooldownSeconds <= 0) {
          clearInterval(timer);
        }
      }, 1000);
    },

    // Temporaire : génère une grille aléatoire pour tester
    generateTestGrid() {
      const total = this.gridSize * this.gridSize;
      for (let i = 0; i < total; i++) {
        const r = Math.floor(Math.random() * 255).toString(16).padStart(2, '0');
        const g = Math.floor(Math.random() * 255).toString(16).padStart(2, '0');
        const b = Math.floor(Math.random() * 255).toString(16).padStart(2, '0');
        this.pixels[i] = {
          x: i % this.gridSize,
          y: Math.floor(i / this.gridSize),
          color: `#${r}${g}${b}`,
          price: 10
        };
      }
    },

    async fetchOwnedColors() {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated) return;
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/colors/owned`, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        });
        this.ownedColors = response.data;
      } catch (error) {
        console.error('Erreur lors de la récupération des couleurs possédées', error);
      }
    },

    async buyColor(color: string) {
      const authStore = useAuthStore();
      const gameStore = useGameStore();
      try {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/colors/buy`,
          { color },
          { headers: { Authorization: `Bearer ${authStore.token}` } }
        );
        this.ownedColors.push(color);
        gameStore.money -= 500;
        return true;
      } catch (error: any) {
        throw new Error(error.response?.data?.message || "Erreur lors de l'achat");
      }
    },

    async fetchOwnedBrushes() {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated) return;
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/brushes/owned`, {
          headers: { Authorization: `Bearer ${authStore.token}` }
        });
        this.ownedBrushes = response.data;
      } catch (error) {
        console.error('Erreur lors de la récupération des pinceaux possédés', error);
      }
    },

    async buyBrush(upgrade: string) {
      const authStore = useAuthStore();
      const gameStore = useGameStore();
      
      const prices: Record<string, number> = {
        "3x3": 500,
        "5x5": 1000,
        "7x7": 2500,
        "9x9": 5000
      };

      try {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/brushes/buy`,
          { upgrade },
          { headers: { Authorization: `Bearer ${authStore.token}` } }
        );
        this.ownedBrushes.push(upgrade);
        gameStore.money -= prices[upgrade] || 0;
        return true;
      } catch (error: any) {
        throw new Error(error.response?.data?.message || "Erreur lors de l'achat");
      }
    }
  }
});

