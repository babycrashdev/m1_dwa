import { defineStore } from 'pinia';
import { Client } from '@stomp/stompjs';
import axios from 'axios';
import { useAuthStore } from './auth';

export const useRPlaceStore = defineStore('rplace', {
  state: () => ({
    pixels: [] as string[],
    gridSize: 0,
    selectedColor: '#FF4500',
    cooldownSeconds: 0,
    stompClient: null as Client | null,
    isInitialLoaded: false
  }),
  actions: {
    async fetchConfig() {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/config/rplace`);
        this.gridSize = response.data.gridSize;
        this.pixels = Array(this.gridSize * this.gridSize).fill('#FFFFFF');
        console.log(`Configuration récupérée : Grille de ${this.gridSize}x${this.gridSize}`);
      } catch (error) {
        console.error('Impossible de récupérer la config r/place', error);
        this.gridSize = 100;
        this.pixels = Array(100 * 100).fill('#FFFFFF');
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
              this.pixels[index] = pixel.color;
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
      if (this.stompClient || !authStore.token) return;

      this.stompClient = new Client({
        brokerURL: import.meta.env.VITE_WS_URL,
        connectHeaders: {
          Authorization: `Bearer ${authStore.token}`
        },
        onConnect: () => {
          console.log('Connecté au WebSocket');
          this.stompClient?.subscribe('/topic/board', (message) => {
            const pixel = JSON.parse(message.body);
            this.updatePixelFromWS(pixel.x, pixel.y, pixel.color);
          });
        },
        onStompError: (frame) => {
          console.error('Erreur STOMP', frame);
        }
      });

      this.stompClient.activate();
    },

    updatePixelFromWS(x: number, y: number, color: string) {
      const index = y * this.gridSize + x;
      this.pixels[index] = color;
    },

    placePixel(x: number, y: number) {
      if (this.cooldownSeconds > 0) return;
      
      if (!this.stompClient || !this.stompClient.connected) {
        console.error('WebSocket non connecté');
        return;
      }

      const payload = { x, y, color: this.selectedColor };
      this.stompClient.publish({
        destination: '/app/place',
        body: JSON.stringify(payload)
      });

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
        this.pixels[i] = `#${r}${g}${b}`;
      }
    }
  }
});
