
import { ref } from 'vue';

export function useClicker() {
    const score = ref(0);
    
    const click = () => {
        score.value++;
    };

    return {
        score,
        click
    };
}
