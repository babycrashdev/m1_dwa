import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAppStore = defineStore('app', () => {
    const showAuth = ref(false);
    const showRules = ref(false);
    const currentView = ref<'grid' | 'clicker'>('grid');

    return {
        showAuth,
        showRules,
        currentView
    };
});
