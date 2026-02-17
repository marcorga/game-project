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
    grounded: false,
    jumpPressed: false // Pour éviter le multi-saut
};

// Environnement
const gravity = 0.5;
const friction = 0.8;
const colors = {
    ground: '#4a2c2a', // Marron terre
    grass: '#2d5a27',  // Vert herbe
    sky: '#87CEEB'     // Bleu ciel
};

// Premier niveau de test (Expert Creative)
const levelWidth = 1500;
const platforms = [
    { x: 0, y: 550, width: levelWidth, height: 50, type: 'ground' }, // Longue base
    { x: 200, y: 450, width: 120, height: 20, type: 'platform' },
    { x: 400, y: 380, width: 120, height: 20, type: 'platform' },
    { x: 600, y: 300, width: 150, height: 20, type: 'platform' },
    { x: 800, y: 220, width: 100, height: 20, type: 'platform' },
    { x: 1000, y: 350, width: 120, height: 20, type: 'platform' },
    { x: 1250, y: 450, width: 150, height: 20, type: 'platform' }
];

// Caméra simple
const camera = {
    x: 0,
    y: 0
};

// Contrôles
const keys = {};
window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

function update() {
    // Mouvement horizontal (Expert QA: Amélioration de la réactivité)
    if (keys['ArrowLeft']) {
        player.vx = -player.speed;
    } else if (keys['ArrowRight']) {
        player.vx = player.speed;
    } else {
        player.vx *= friction;
        if (Math.abs(player.vx) < 0.1) player.vx = 0;
    }

    // Saut (Expert QA: Correction du saut continu)
    if (keys['Space']) {
        if (player.grounded && !player.jumpPressed) {
            player.vy = player.jumpStrength;
            player.grounded = false;
            player.jumpPressed = true;
        }
    } else {
        player.jumpPressed = false;
    }

    // Gravité
    player.vy += gravity;

    // Mise à jour position
    player.x += player.vx;
    player.y += player.vy;

    // Collisions avec les plateformes (Expert QA: Robustesse des collisions)
    player.grounded = false;
    for (const plat of platforms) {
        if (player.x < plat.x + plat.width &&
            player.x + player.width > plat.x &&
            player.y < plat.y + plat.height &&
            player.y + player.height > plat.y) {
            
            // Collision par le haut (Atterrissage)
            if (player.vy > 0 && (player.y + player.height - player.vy) <= plat.y) {
                player.y = plat.y - player.height;
                player.vy = 0;
                player.grounded = true;
            }
            // Collision par le bas (Tête contre plateforme)
            else if (player.vy < 0 && (player.y - player.vy) >= (plat.y + plat.height)) {
                player.y = plat.y + plat.height;
                player.vy = 0;
            }
        }
    }

    // Limites de monde
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > levelWidth) player.x = levelWidth - player.width;
    
    // Suivi de caméra fluide (Expert QA: Interpolation simple)
    let targetCameraX = player.x - canvas.width / 2;
    camera.x += (targetCameraX - camera.x) * 0.1;

    // Bornes de caméra
    if (camera.x < 0) camera.x = 0;
    if (camera.x > levelWidth - canvas.width) camera.x = levelWidth - canvas.width;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(-Math.floor(camera.x), 0);

    // Fond ciel
    ctx.fillStyle = colors.sky;
    ctx.fillRect(Math.floor(camera.x), 0, canvas.width, canvas.height);
    
    // Dessiner les plateformes
    for (const plat of platforms) {
        if (plat.type === 'ground') {
            ctx.fillStyle = colors.ground;
            ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
            ctx.fillStyle = colors.grass;
            ctx.fillRect(plat.x, plat.y, plat.width, 10);
        } else {
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
            ctx.strokeStyle = '#5D2E0C';
            ctx.strokeRect(plat.x, plat.y, plat.width, plat.height);
        }
    }

    // Dessiner le joueur
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    ctx.fillStyle = player.eyeColor;
    const eyeOffset = player.vx >= 0 ? 18 : 5;
    ctx.fillRect(player.x + eyeOffset, player.y + 8, 5, 5);
    ctx.fillRect(player.x + eyeOffset + 4, player.y + 8, 5, 5);
    
    ctx.restore();

    ctx.fillStyle = 'black';
    ctx.font = '16px Arial';
    ctx.fillText('Optimisation QA : Caméra fluide & Collisions robustes', 10, 30);
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();
console.log("Optimisations QA appliquées.");