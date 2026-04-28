/* Generer par IA*/


export const CITY_MAP_WIDTH = 7;
export const CITY_MAP_HEIGHT = 4;

export interface MapTile {
    x: number;
    y: number;
    type: 'ROAD' | 'ACTION' | 'EMPTY';
}

const routePoints = [
    {x: 1, y: 4}, {x: 2, y: 4}, {x: 2, y: 3}, {x: 6, y: 3},
    {x: 6, y: 2}, {x: 2, y: 2}, {x: 2, y: 1}
];

export const CITY_TILES: MapTile[] = [];

const fullRoadTiles: {x: number, y: number}[] = [];
for (let i = 0; i < routePoints.length - 1; i++) {
    const p1 = routePoints[i];
    const p2 = routePoints[i+1];
    
    if (!p1 || !p2) continue;

    const minX = Math.min(p1.x, p2.x);
    const maxX = Math.max(p1.x, p2.x);
    const minY = Math.min(p1.y, p2.y);
    const maxY = Math.max(p1.y, p2.y);
    
    for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
            if (!fullRoadTiles.some(p => p.x === x && p.y === y)) {
                fullRoadTiles.push({x, y});
            }
        }
    }
}

for (let y = 1; y <= CITY_MAP_HEIGHT; y++) {
    for (let x = 1; x <= CITY_MAP_WIDTH; x++) {
        const isRoad = fullRoadTiles.some(p => p.x === x && p.y === y);
        
        const actionCoords = [
            {x:3, y:4}, {x:4, y:4}, {x:5, y:4}, {x:6, y:4}, {x:7, y:4},
            {x:7, y:3}, {x:7, y:2}, {x:7, y:1},
            {x:6, y:1}, {x:5, y:1}, {x:4, y:1}, {x:3, y:1}
        ];
        
        const isAction = !isRoad && actionCoords.some(p => p.x === x && p.y === y);

        CITY_TILES.push({
            x: x - 1,
            y: y - 1,
            type: isRoad ? 'ROAD' : (isAction ? 'ACTION' : 'EMPTY')
        });
    }
}

export const CITY_SVG_PATH = [
    "M 50 350",
    "L 140 350", "Q 180 350 180 310",
    "L 180 300", "Q 180 280 200 280",
    "L 570 280", "Q 610 280 610 240",
    "L 610 160", "Q 610 120 570 120",
    "L 190 120", "Q 150 120 150 80",
    "L 150 50"                        
].join(" ");