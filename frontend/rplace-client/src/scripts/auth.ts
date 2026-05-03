
import { ref, reactive, watch } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../stores/auth';
import { useGameStore } from '../stores/game';

export function useAuth() {
  const authStore = useAuthStore();
  const mode = ref<'login' | 'register' | 'logout'>('login');
  const loading = ref(false);
  const message = ref('');
  const messageType = ref<'success' | 'error'>('success');

  const user = reactive({
    username: '',
    password: '',
    age: null as number | null,
    country: '',
    rememberMe: false
  });

  watch(mode, () => {
    message.value = '';
  });

  const handleSubmit = async (onSuccess?: () => void) => {
    loading.value = true;
    message.value = '';

    const endpoint = mode.value === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload = mode.value === 'login'
      ? { username: user.username, password: user.password }
      : { ...user };

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}${endpoint}`, payload);

      if (mode.value === 'login') {
        const { token } = response.data;
        authStore.setToken(token);

        try {
          const userResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const userData = userResponse.data;
          authStore.setUser(userData);

          const gameStore = useGameStore();
          gameStore.money = userData.moneys || 0;
        } catch (meError) {
          console.error("Erreur lors de la récupération du profil:", meError);
          authStore.setUser({
            username: response.data.username,
            age: response.data.age,
            country: response.data.country
          });
        }

        message.value = "Connexion réussie !";
        messageType.value = 'success';

        if (onSuccess) {
          setTimeout(() => onSuccess(), 1000);
        }
      } else {
        message.value = response.data;
        messageType.value = 'success';
        setTimeout(() => mode.value = 'login', 1500);
      }
    } catch (error: any) {
      message.value = error.response?.data || "Une erreur est survenue";
      messageType.value = 'error';
    } finally {
      loading.value = false;
    }
  };

  const logout = () => {
    authStore.logout();
    message.value = "Déconnecté";
    messageType.value = 'success';
  };

  const fetchProfile = async () => {
    if (!authStore.token) return;
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/me`, {
        headers: { Authorization: `Bearer ${authStore.token}` }
      });
      authStore.setUser(response.data);

      user.age = response.data.age;
      user.country = response.data.country;
      user.password = '********';
    } catch (error) {
      console.error("Erreur refresh profil:", error);
    }
  };

  const handleUpdate = async (onSuccess?: () => void) => {
    loading.value = true;
    message.value = '';
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/user/profile`, {
        password: user.password,
        age: user.age,
        country: user.country
      }, {
        headers: { Authorization: `Bearer ${authStore.token}` }
      });
      message.value = "Profil mis à jour !";
      messageType.value = 'success';
      await fetchProfile();
      
      if (onSuccess) {
        setTimeout(() => onSuccess(), 1000);
      }
    } catch (error: any) {
      message.value = error.response?.data || "Erreur de mise à jour";
      messageType.value = 'error';
    } finally {
      loading.value = false;
    }
  };

  const handleLogout = (emitClose?: () => void) => {
    logout();
    if (emitClose) {
      setTimeout(() => emitClose(), 1000);
    }
  };

  watch(() => authStore.isAuthenticated, (isAuth) => {
    if (isAuth) mode.value = 'logout';
    else if (mode.value === 'logout') mode.value = 'login';
  });

  return {
    mode,
    loading,
    message,
    messageType,
    user,
    handleSubmit,
    logout,
    fetchProfile,
    handleUpdate,
    handleLogout,
    authStore,
    isAuthenticated: authStore.isAuthenticated
  };
}
