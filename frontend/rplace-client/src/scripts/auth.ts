
import { ref, reactive, watch } from 'vue';
import axios from 'axios';

export function useAuth() {
  const mode = ref<'login' | 'register'>('login');
  const loading = ref(false);
  const message = ref('');
  const messageType = ref<'success' | 'error'>('success');

  const user = reactive({
    username: '',
    password: '',
    age: null as number | null,
    country: ''
  });

  // Reset messages when switching mode
  watch(mode, () => {
    message.value = '';
  });

  const handleSubmit = async () => {
    loading.value = true;
    message.value = '';
    
    const endpoint = mode.value === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload = mode.value === 'login' 
      ? { username: user.username, password: user.password }
      : { ...user };

    try {
      const response = await axios.post(`http://localhost:8080${endpoint}`, payload);
      message.value = response.data;
      messageType.value = 'success';
      
      if (mode.value === 'register') {
        setTimeout(() => mode.value = 'login', 1500);
      }
    } catch (error: any) {
      message.value = error.response?.data || "Une erreur est survenue";
      messageType.value = 'error';
    } finally {
      loading.value = false;
    }
  };

  return {
    mode,
    loading,
    message,
    messageType,
    user,
    handleSubmit
  };
}
