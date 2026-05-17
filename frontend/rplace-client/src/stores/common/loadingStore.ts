/* Aider par l'IA pour structurer et faire fonctionner correctement */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';

export interface GameTip {
    id: number;
    content: string;
}

export const useLoadingStore = defineStore('loading', () => {
    const isLoading = ref(true);
    const tips = ref<GameTip[]>([]);
    const currentIndex = ref(0);
    const currentTip = ref("Initialisation du système...");
    const minLoadingTime = ref(1500);

    const fetchTips = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/config/tips`);
            tips.value = response.data.tips;
            if (response.data.defaultTime) {
                minLoadingTime.value = response.data.defaultTime;
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des tips:", error);
            tips.value = [{ id: 0, content: "Chargement de l'univers..." }];
        }
    };

    const updateCurrentTip = () => {
        if (tips.value.length > 0) {
            const tip = tips.value[currentIndex.value];
            if (tip) {
                currentTip.value = tip.content;
            }
        }
    };

    const selectRandomTip = () => {
        if (tips.value.length > 0) {
            currentIndex.value = Math.floor(Math.random() * tips.value.length);
            updateCurrentTip();
        } else {
            currentTip.value = "Préparation de la grille de pixels...";
        }
    };

    const nextTip = () => {
        if (tips.value.length > 0) {
            currentIndex.value = (currentIndex.value + 1) % tips.value.length;
            updateCurrentTip();
        }
    };

    const prevTip = () => {
        if (tips.value.length > 0) {
            currentIndex.value = (currentIndex.value - 1 + tips.value.length) % tips.value.length;
            updateCurrentTip();
        }
    };

    const startLoading = () => {
        selectRandomTip();
        isLoading.value = true;
    };

    const stopLoading = () => {
        isLoading.value = false;
    };

    const performTransition = async (action: () => void) => {
        const startTime = Date.now();
        startLoading();

        await new Promise(resolve => setTimeout(resolve, 300));

        try {
            await action();
        } catch (error) {
            console.error("Erreur durant la transition:", error);
        }

        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, minLoadingTime.value - elapsedTime);

        setTimeout(() => {
            stopLoading();
        }, remainingTime);
    };

    return {
        isLoading,
        currentTip,
        minLoadingTime,
        tips,
        fetchTips,
        startLoading,
        stopLoading,
        performTransition,
        nextTip,
        prevTip
    };
});
