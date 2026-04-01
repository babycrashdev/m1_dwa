import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';

export const useAuthStore = defineStore('auth', () => {
    const token = ref(localStorage.getItem('token') || null);
    const user = ref(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null);
    
    const isAuthenticated = computed(() => !!token.value);

    function setToken(newToken: string) {
        token.value = newToken;
        localStorage.setItem('token', newToken);
    }

    function setUser(newUser: any) {
        user.value = newUser;
        localStorage.setItem('user', JSON.stringify(newUser));
    }

    function logout() {
        token.value = null;
        user.value = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    return {
        token,
        user,
        isAuthenticated,
        setToken,
        setUser,
        logout
    };
});
