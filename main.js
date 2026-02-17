const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

// Configuration du joueur
const player = {
    x: 50,
    y: 50,
    width: 30,
    height: 30,
    color: '#FFD700', // Or pour le personnage
    eyeColor: '#000',
    vx: 0,
    vy: 0,
    speed: 5,
    jumpStrength: -10,
    grounded: false
};

// Environnement
const gravity = 0.5;
const friction = 0.8;
const colors = {
    ground: '#4a2c2a', // Marron terre
    grass: '#2d5a27',  // Vert herbe
    sky: '#87CEEB'     // Bleu ciel
};

const platforms = [
    { x: 0, y: 550, width: 800, height: 50, type: 'ground' }, // Sol
    { x: 200, y: 450, width: 150, height: 20, type: 'platform' },
    { x: 450, y: 350, width: 150, height: 20, type: 'platform' },
    { x: 150, y: 250, width: 150, height: 20, type: 'platform' }
];

// Contrôles
const keys = {};
window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

function update() {
    // Mouvement horizontal
    if (keys['ArrowLeft']) player.vx = -player.speed;
    else if (keys['ArrowRight']) player.vx = player.speed;
    else player.vx *= friction;

    // Saut
    if (keys['Space'] && player.grounded) {
        player.vy = player.jumpStrength;
        player.grounded = false;
    }

    // Gravité
    player.vy += gravity;

    // Mise à jour position
    player.x += player.vx;
    player.y += player.vy;

    // Collisions avec les plateformes
    player.grounded = false;
    for (const plat of platforms) {
        if (player.x < plat.x + plat.width &&
            player.x + player.width > plat.x &&
            player.y < plat.y + plat.height &&
            player.y + player.height > plat.y) {
            
            // Collision simple par le haut (pour cet exemple)
            if (player.vy > 0 && player.y + player.height - player.vy <= plat.y) {
                player.y = plat.y - player.height;
                player.vy = 0;
                player.grounded = true;
            }
        }
    }

    // Limites du canvas
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
}

function draw() {
    // Fond ciel
    ctx.fillStyle = colors.sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Dessiner les plateformes
    for (const plat of platforms) {
        if (plat.type === 'ground') {
            ctx.fillStyle = colors.ground;
            ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
            // Bord herbe
            ctx.fillStyle = colors.grass;
            ctx.fillRect(plat.x, plat.y, plat.width, 10);
        } else {
            ctx.fillStyle = '#8B4513'; // Bois
            ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
            ctx.strokeStyle = '#5D2E0C';
            ctx.strokeRect(plat.x, plat.y, plat.width, plat.height);
        }
    }

    // Dessiner le joueur (Petit personnage avec yeux)
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Yeux selon direction
    ctx.fillStyle = player.eyeColor;
    const eyeOffset = player.vx >= 0 ? 18 : 5;
    ctx.fillRect(player.x + eyeOffset, player.y + 8, 5, 5);
    ctx.fillRect(player.x + eyeOffset + 4, player.y + 8, 5, 5);
    
    ctx.fillStyle = 'black';
    ctx.font = '16px Arial';
    ctx.fillText('Design visuel appliqué', 10, 30);
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();
console.log("Physique et contrôles initialisés.");