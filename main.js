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
    color: '#00FF00',
    vx: 0,
    vy: 0,
    speed: 5,
    jumpStrength: -10,
    grounded: false
};

// Environnement
const gravity = 0.5;
const friction = 0.8;
const platforms = [
    { x: 0, y: 550, width: 800, height: 50 }, // Sol
    { x: 200, y: 450, width: 150, height: 20 },
    { x: 450, y: 350, width: 150, height: 20 },
    { x: 150, y: 250, width: 150, height: 20 }
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dessiner les plateformes
    ctx.fillStyle = '#555';
    for (const plat of platforms) {
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
    }

    // Dessiner le joueur
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.fillText('Flèches pour bouger, Espace pour sauter', 10, 30);
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();
console.log("Physique et contrôles initialisés.");