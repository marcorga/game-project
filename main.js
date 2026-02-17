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
    jumpPressed: false
};

// Système de particules (Expert VFX)
const particles = [];
function createParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            size: Math.random() * 4 + 2,
            life: 1.0,
            color: color
        });
    }
}

// Environnement
const gravity = 0.5;
const friction = 0.8;
const colors = {
    ground: '#4a2c2a',
    grass: '#2d5a27',
    sky: '#87CEEB',
    dust: '#FFF'
};

const levelWidth = 1500;
const platforms = [
    { x: 0, y: 550, width: levelWidth, height: 50, type: 'ground' },
    { x: 200, y: 450, width: 120, height: 20, type: 'platform' },
    { x: 400, y: 380, width: 120, height: 20, type: 'platform' },
    { x: 600, y: 300, width: 150, height: 20, type: 'platform' },
    { x: 800, y: 220, width: 100, height: 20, type: 'platform' },
    { x: 1000, y: 350, width: 120, height: 20, type: 'platform' },
    { x: 1250, y: 450, width: 150, height: 20, type: 'platform' }
];

const camera = { x: 0, y: 0 };
const keys = {};
window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

function update() {
    let wasGrounded = player.grounded;

    if (keys['ArrowLeft']) player.vx = -player.speed;
    else if (keys['ArrowRight']) player.vx = player.speed;
    else {
        player.vx *= friction;
        if (Math.abs(player.vx) < 0.1) player.vx = 0;
    }

    if (keys['Space']) {
        if (player.grounded && !player.jumpPressed) {
            player.vy = player.jumpStrength;
            player.grounded = false;
            player.jumpPressed = true;
            // VFX: Particules de saut
            createParticles(player.x + player.width/2, player.y + player.height, colors.dust, 8);
        }
    } else {
        player.jumpPressed = false;
    }

    player.vy += gravity;
    player.x += player.vx;
    player.y += player.vy;

    player.grounded = false;
    for (const plat of platforms) {
        if (player.x < plat.x + plat.width && player.x + player.width > plat.x &&
            player.y < plat.y + plat.height && player.y + player.height > plat.y) {
            if (player.vy > 0 && (player.y + player.height - player.vy) <= plat.y) {
                player.y = plat.y - player.height;
                player.vy = 0;
                player.grounded = true;
                // VFX: Particules d'atterrissage
                if (!wasGrounded) {
                    createParticles(player.x + player.width/2, player.y + player.height, colors.dust, 5);
                }
            } else if (player.vy < 0 && (player.y - player.vy) >= (plat.y + plat.height)) {
                player.y = plat.y + plat.height;
                player.vy = 0;
            }
        }
    }

    if (player.x < 0) player.x = 0;
    if (player.x + player.width > levelWidth) player.x = levelWidth - player.width;
    
    let targetCameraX = player.x - canvas.width / 2;
    camera.x += (targetCameraX - camera.x) * 0.1;
    if (camera.x < 0) camera.x = 0;
    if (camera.x > levelWidth - canvas.width) camera.x = levelWidth - canvas.width;

    // Mise à jour des particules
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        if (p.life <= 0) particles.splice(i, 1);
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(-Math.floor(camera.x), 0);

    ctx.fillStyle = colors.sky;
    ctx.fillRect(Math.floor(camera.x), 0, canvas.width, canvas.height);
    
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

    // Dessiner les particules (VFX)
    for (const p of particles) {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1.0;

    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.fillStyle = player.eyeColor;
    const eyeOffset = player.vx >= 0 ? 18 : 5;
    ctx.fillRect(player.x + eyeOffset, player.y + 8, 5, 5);
    ctx.fillRect(player.x + eyeOffset + 4, player.y + 8, 5, 5);
    
    ctx.restore();

    ctx.fillStyle = 'black';
    ctx.font = '16px Arial';
    ctx.fillText('VFX: Système de particules ajouté (Saut/Atterrissage)', 10, 30);
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();
console.log("Système VFX activé.");