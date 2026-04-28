/* Temporaire */
import { ref } from 'vue';
import { type MapTile } from './mapConfig';

export function useCityMapLogic() {
    const handleActionClick = (tile: MapTile) => {
        console.log(`[Action] Interaction avec la case en position: ${tile.x + 1},${tile.y + 1}`);
        // TODO: Ajouter le menu d'upgrade
    };

    return {
        handleActionClick
    };
}
