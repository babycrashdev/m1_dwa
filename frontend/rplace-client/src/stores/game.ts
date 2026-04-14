import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useGameStore = defineStore('game', () => {
    const money = ref(0);
    const cars = ref<{ id: number; pathIndex: number; weight: number; value: number }[]>([]);
    
    const currentWeight = ref(0);
    const spawnProgress = ref(0);
    const SPAWN_INTERVAL_MS = 4000;
    const TICK_INTERVAL_MS = 50;

    function addWeight() {
        currentWeight.value++;
    }

    function spawnGroupedCar() {
        if (currentWeight.value > 0) {
            const newCar = {
                id: Date.now(),
                pathIndex: 0,
                weight: currentWeight.value,
                value: currentWeight.value * 10 // TODO: 10 prix de vente de base
            };
            cars.value.push(newCar);
            currentWeight.value = 0;
            console.log(newCar.weight, "voitures expediees");
            
            // TODO: Animation + mouvement
            sellCar(newCar.id);
        }
    }

    function sellCar(carId: number) {
        const index = cars.value.findIndex(c => c.id === carId);
        if (index !== -1) {
            const car = cars.value[index];
            if (car) {
                money.value += car.value;
                cars.value.splice(index, 1);
                console.log("Voiture vendue ! Gain :", car.value, "Total :", money.value);
                // TODO: appel api backend
            }
        }
    }

    let progressInterval: number | null = null;
    function startSpawnerTimer() {
        if (progressInterval) return;
        
        progressInterval = window.setInterval(() => {
            spawnProgress.value += (TICK_INTERVAL_MS / SPAWN_INTERVAL_MS) * 100;
            
            if (spawnProgress.value >= 100) {
                spawnProgress.value = 0;
                spawnGroupedCar();
            }
        }, TICK_INTERVAL_MS);
    }

    return {
        money,
        cars,
        currentWeight,
        spawnProgress,
        addWeight,
        startSpawnerTimer
    };
});
