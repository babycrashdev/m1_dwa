
import { useAuthStore } from '../stores/auth';
import { useApp } from './app';

export function useProfile() {
    const authStore = useAuthStore();
    const { showAuth } = useApp();

    const handleLogout = (close: () => void) => {
        authStore.logout();
        close();
    };

    return {
        user: authStore.user,
        handleLogout
    };
}
