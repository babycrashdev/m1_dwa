import { useRPlaceStore } from '../../stores/rplace';

export function useColorPalette() {
  const store = useRPlaceStore();
  
  const colors = [
    '#FF4500', '#FFA800', '#FFD635', '#00A368', 
    '#3690EA', '#ffffffff', '#811E9F', '#000000'
  ];

  return {
    colors
  };
}
