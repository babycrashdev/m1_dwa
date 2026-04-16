import { defineStore } from 'pinia';

export const useRPlaceStore = defineStore('rplace', {
  state: () => ({
    pixels: Array(100 * 100).fill('#FFFFFF') as string[],
    gridSize: 100,
    selectedColor: '#FF4500',
    cooldownSeconds: 0
  }),
  actions: {
    generateTestGrid() {
      for (let i = 0; i < 10000; i++) {
        const r = Math.floor(Math.random() * 255).toString(16).padStart(2, '0');
        const g = Math.floor(Math.random() * 255).toString(16).padStart(2, '0');
        const b = Math.floor(Math.random() * 255).toString(16).padStart(2, '0');
        this.pixels[i] = `#${r}${g}${b}`;
      }
    },
    placePixel(x: number, y: number) {
      if (x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize) {
        const index = y * this.gridSize + x;
        this.pixels[index] = this.selectedColor;
      }
    }
  }
});
