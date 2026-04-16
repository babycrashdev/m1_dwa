import { defineStore } from 'pinia';
import { Client } from '@stomp/stompjs';
import axios from 'axios';
import { useAuthStore } from './auth';

export const useRPlaceStore = defineStore('rplace', {
  state: () => ({
    pixels: Array(100 * 100).fill('#FFFFFF') as string[],
    gridSize: 100,
    selectedColor: '#FF4500',
    cooldownSeconds: 0,
    stompClient: null as Client | null,
    isInitialLoaded: false
  }),
  actions: {
    async fetchInitialBoard() {
      try {
        const response = await axios.get('http://localhost:8080/api/pixels');
        if (Array.isArray(response.data)) {
          response.data.forEach((pixel: any) => {
            const index = pixel.y * this.gridSize + pixel.x;
            this.pixels[index] = pixel.color;
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
        brokerURL: 'ws://localhost:8080/ws',
        connectHeaders: {
          Authorization: `Bearer ${authStore.token}`
        },
        onConnect: () => {
          console.log('Connecté au WebSocket');
          this.stompClient?.subscribe('/topic/board', (message) => {
            const pixel = JSON.parse(message.body);
            const index = pixel.y * this.gridSize + pixel.x;
            this.pixels[index] = pixel.color;
          });
        },
        onStompError: (frame) => {
          console.error('Erreur STOMP', frame);
        }
      });

      this.stompClient.activate();
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
      for (let i = 0; i < 10000; i++) {
        const r = Math.floor(Math.random() * 255).toString(16).padStart(2, '0');
        const g = Math.floor(Math.random() * 255).toString(16).padStart(2, '0');
        const b = Math.floor(Math.random() * 255).toString(16).padStart(2, '0');
        this.pixels[i] = `#${r}${g}${b}`;
      }
    }
  }
});
