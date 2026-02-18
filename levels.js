// levels.js - Données des niveaux
const levels = [
    {
        width: 1500,
        timeLimit: 60,
        platforms: [
            { x: 0, y: 550, width: 1500, height: 50, type: 'ground' },
            { x: 200, y: 450, width: 120, height: 20, type: 'platform' },
            { x: 400, y: 380, width: 120, height: 20, type: 'platform' },
            { x: 600, y: 300, width: 150, height: 20, type: 'platform' },
            { x: 800, y: 220, width: 100, height: 20, type: 'platform' },
            { x: 1000, y: 350, width: 120, height: 20, type: 'platform' },
            { x: 1250, y: 450, width: 150, height: 20, type: 'platform' }
        ],
        enemies: [
            { x: 400, y: 520, width: 30, height: 30, color: '#FF4444', vx: 2, range: 100, startX: 400 },
            { x: 900, y: 520, width: 30, height: 30, color: '#FF4444', vx: 3, range: 200, startX: 900 }
        ],
        coins: [
            { x: 250, y: 400 }, { x: 450, y: 330 }, { x: 650, y: 250 }, { x: 1050, y: 300 }
        ],
        goal: { x: 1400, y: 470, width: 40, height: 80 }
    },
    {
        width: 1800,
        timeLimit: 90,
        platforms: [
            { x: 0, y: 550, width: 500, height: 50, type: 'ground' },
            { x: 600, y: 550, width: 600, height: 50, type: 'ground' },
            { x: 1300, y: 550, width: 500, height: 50, type: 'ground' },
            { x: 100, y: 450, width: 100, height: 20, type: 'platform' },
            { x: 300, y: 350, width: 120, height: 20, type: 'platform' },
            { x: 520, y: 260, width: 100, height: 20, type: 'platform' },
            { x: 750, y: 250, width: 150, height: 20, type: 'platform' },
            { x: 1000, y: 350, width: 100, height: 20, type: 'platform', moving: true, vx: 2, vy: 0, rangeX: 100, rangeY: 0, startX: 1000, startY: 350 },
            { x: 1200, y: 450, width: 100, height: 20, type: 'platform' },
            { x: 1450, y: 350, width: 150, height: 20, type: 'platform' },
            { x: 1650, y: 250, width: 100, height: 20, type: 'platform', moving: true, vx: 0, vy: 1, rangeX: 0, rangeY: 150, startX: 1650, startY: 250, speed: 0.02 }
        ],
        enemies: [
            { x: 200, y: 520, width: 30, height: 30, color: '#FF4444', vx: 1.5, range: 80, startX: 200 },
            { x: 800, y: 520, width: 30, height: 30, color: '#FF4444', vx: 3, range: 150, startX: 800 },
            { x: 1400, y: 520, width: 30, height: 30, color: '#FF4444', vx: 2.5, range: 100, startX: 1400 },
            { x: 750, y: 220, width: 30, height: 30, color: '#FF4444', vx: 1.5, range: 40, startX: 750 }
        ],
        coins: [
            { x: 150, y: 400 }, { x: 350, y: 300 }, { x: 550, y: 200 }, { x: 825, y: 200 }, { x: 1500, y: 300 }
        ],
        items: [
            { x: 900, y: 200, type: 'heart' }
        ],
        goal: { x: 1700, y: 470, width: 40, height: 80 }
    }
];
