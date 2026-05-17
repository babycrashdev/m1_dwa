/* Aider par l'IA pour structurer et faire fonctionner correctement */
import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';
import { useAppStore } from '../app';

export const useServerStore = defineStore('server', () => {
    const isOnline = ref(true);
    const consecutiveFailures = ref(0);
    const pollingIntervalId = ref<number | null>(null);

    const appStore = useAppStore();

    const reportSuccess = () => {
        consecutiveFailures.value = 0;
        if (!isOnline.value) {
            console.log('[ServerSecurity] Serveur rétabli !');
            isOnline.value = true;
            stopPolling();
        }
    };

    const reportFailure = () => {
        consecutiveFailures.value++;
        console.warn(`[ServerSecurity] Échec de connexion détecté (${consecutiveFailures.value}/2)`);

        if (consecutiveFailures.value >= 2 && isOnline.value) {
            console.error('[ServerSecurity] Serveur hors-ligne. Passage en mode sécurité.');
            isOnline.value = false;
            
            appStore.currentView = 'grid';
            
            startPolling();
        }
    };

    const startPolling = () => {
        if (pollingIntervalId.value) return;

        console.log('[ServerSecurity] Démarrage du polling de reconnexion...');
        pollingIntervalId.value = window.setInterval(async () => {
            try {
                await axios.get(`${import.meta.env.VITE_API_URL}/api/config/tips`);
                reportSuccess();
            } catch (error) {
                console.log('[ServerSecurity] Tentative de reconnexion... (Serveur toujours indisponible)');
            }
        }, 5000);
    };

    const stopPolling = () => {
        if (pollingIntervalId.value) {
            clearInterval(pollingIntervalId.value);
            pollingIntervalId.value = null;
            console.log('[ServerSecurity] Polling arrêté.');
        }
    };

    return {
        isOnline,
        consecutiveFailures,
        reportSuccess,
        reportFailure
    };
});
