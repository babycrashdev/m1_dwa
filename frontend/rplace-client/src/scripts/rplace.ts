import { useRPlaceStore } from '../stores/rplace';

export function useRPlace() {
  const store = useRPlaceStore();

  return {
    store
  };
}
