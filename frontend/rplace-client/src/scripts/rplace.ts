import { useRPlaceStore } from '../stores/rplace/rplace';

export function useRPlace() {
  const store = useRPlaceStore();

  return {
    store
  };
}
