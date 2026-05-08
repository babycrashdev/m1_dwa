
import axios from 'axios';
import { useServerStore } from '../stores/common/serverStore';

export function setupAxiosInterceptors() {
    axios.interceptors.response.use(
        (response) => {
            const serverStore = useServerStore();
            serverStore.reportSuccess();
            return response;
        },
        (error) => {
            const serverStore = useServerStore();

            if (!error.response) {
                serverStore.reportFailure();
            } else if (error.response.status >= 500) {
                serverStore.reportFailure();
            }

            return Promise.reject(error);
        }
    );

    console.log('[ServerSecurity] Intercepteurs Axios configurés.');
}
