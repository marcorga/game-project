const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

// Expert Profiler: Stats Tracking
const stats = {
    fps: 0,
    lastTime: performance.now(),
    frameCount: 0,
    particleCount: 0
};

// --- DATA: LEVELS (Expert Creative) ---
const levels = [
    {
        width: 1500,
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
        goal: { x: 1400, y: 470, width: 40, height: 80 }
    },
    {
        width: 1800,
        platforms: [
            { x: 0, y: 550, width: 500, height: 50, type: 'ground' },
            { x: 600, y: 550, width: 600, height: 50, type: 'ground' },
            { x: 1300, y: 550, width: 500, height: 50, type: 'ground' },
            { x: 100, y: 450, width: 100, height: 20, type: 'platform' },
            { x: 300, y: 350, width: 100, height: 20, type: 'platform' },
            { x: 500, y: 250, width: 100, height: 20, type: 'platform' },
            { x: 750, y: 250, width: 150, height: 20, type: 'platform' },
            { x: 1000, y: 350, width: 100, height: 20, type: 'platform' },
            { x: 1200, y: 450, width: 100, height: 20, type: 'platform' },
            { x: 1450, y: 350, width: 150, height: 20, type: 'platform' }
        ],
        enemies: [
            { x: 200, y: 520, width: 30, height: 30, color: '#FF4444', vx: 2, range: 100, startX: 200 },
            { x: 800, y: 520, width: 30, height: 30, color: '#FF4444', vx: 4, range: 150, startX: 800 },
            { x: 1400, y: 520, width: 30, height: 30, color: '#FF4444', vx: 3, range: 100, startX: 1400 },
            { x: 750, y: 220, width: 30, height: 30, color: '#FF4444', vx: 2, range: 50, startX: 750 }
        ],
        goal: { x: 1700, y: 470, width: 40, height: 80 }
    }
];

let currentLevelIndex = 0;

// --- SAVE SYSTEM (Expert Engine) ---
function saveGame() {
    const saveData = {
        totalWins: player.totalWins,
        currentLevel: currentLevelIndex
    };
    localStorage.setItem('platformer_save', JSON.stringify(saveData));
    console.log("Jeu sauvegardé.");
}

function loadGame() {
    const saved = localStorage.getItem('platformer_save');
    if (saved) {
        const data = JSON.parse(saved);
        player.totalWins = data.totalWins || 0;
        currentLevelIndex = data.currentLevel || 0;
        console.log("Jeu chargé.");
    }
}

// --- GAME OBJECTS ---
const player = {
    x: 50,
    y: 50,
    width: 30,
    height: 30,
    color: '#FFD700',
    eyeColor: '#000',
    vx: 0,
    vy: 0,
    speed: 5,
    jumpStrength: -10,
    grounded: false,
    jumpPressed: false,
    alive: true,
    totalWins: 0
};

const particles = [];
const MAX_PARTICLES = 200;

let currentLevel = null;
let enemies = [];
let platforms = [];
const goal = { x: 0, y: 0, width: 0, height: 0, color: '#FF00FF', reached: false };
const camera = { x: 0, y: 0 };

function initLevel(index) {
    currentLevelIndex = index % levels.length;
    currentLevel = levels[currentLevelIndex];
    
    // Reset player position
    player.x = 50;
    player.y = 50;
    player.vx = 0;
    player.vy = 0;
    player.alive = true;
    
    // Load level data
    platforms = currentLevel.platforms;
    goal.x = currentLevel.goal.x;
    goal.y = currentLevel.goal.y;
    goal.width = currentLevel.goal.width;
    goal.height = currentLevel.goal.height;
    goal.reached = false;
    
    // Deep copy enemies
    enemies = currentLevel.enemies.map(en => ({ ...en }));
    
    saveGame(); // Expert Engine: Save on level start
}

// --- SYSTEMS ---

function createParticles(x, y, color, count) {
    const spaceLeft = MAX_PARTICLES - particles.length;
    const actualCount = Math.min(count, spaceLeft);
    for (let i = 0; i < actualCount; i++) {
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

function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const en = enemies[i];
        en.x += en.vx;
        if (Math.abs(en.x - en.startX) > en.range) {
            en.vx *= -1;
        }

        if (player.alive && !goal.reached &&
            player.x < en.x + en.width &&
            player.x + player.width > en.x &&
            player.y < en.y + en.height &&
            player.y + player.height > en.y) {
            
            if (player.vy > 0 && player.y + player.height - player.vy <= en.y) {
                createParticles(en.x + en.width/2, en.y + en.height/2, en.color, 15);
                enemies.splice(i, 1);
                player.vy = player.jumpStrength * 0.8;
            } else {
                killPlayer();
            }
        }
    }
}

function killPlayer() {
    player.alive = false;
    createParticles(player.x + player.width/2, player.y + player.height/2, player.color, 20);
    setTimeout(() => {
        initLevel(currentLevelIndex);
    }, 1000);
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

const keys = {};
window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

function update() {
    stats.frameCount++;
    const now = performance.now();
    if (now > stats.lastTime + 1000) {
        stats.fps = Math.round((stats.frameCount * 1000) / (now - stats.lastTime));
        stats.frameCount = 0;
        stats.lastTime = now;
    }

    if (!player.alive) {
        updateParticles();
        return;
    }

    if (goal.reached) {
        updateParticles();
        if (keys['Enter']) {
            initLevel(currentLevelIndex + 1);
        }
        return;
    }

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
                if (!wasGrounded) {
                    createParticles(player.x + player.width/2, player.y + player.height, colors.dust, 5);
                }
            } else if (player.vy < 0 && (player.y - player.vy) >= (plat.y + plat.height)) {
                player.y = plat.y + plat.height;
                player.vy = 0;
            }
        }
    }

    // Victoire
    if (player.x < goal.x + goal.width &&
        player.x + player.width > goal.x &&
        player.y < goal.y + goal.height &&
        player.y + player.height > goal.y) {
        goal.reached = true;
        player.totalWins++;
        createParticles(goal.x + goal.width/2, goal.y + goal.height/2, '#FFFF00', 50);
        saveGame(); // Expert Engine: Save on win
    }

    // Death by falling
    if (player.y > canvas.height + 100) {
        killPlayer();
    }

    if (player.x < 0) player.x = 0;
    if (player.x + player.width > currentLevel.width) player.x = currentLevel.width - player.width;
    
    let targetCameraX = player.x - canvas.width / 2;
    camera.x += (targetCameraX - camera.x) * 0.1;
    if (camera.x < 0) camera.x = 0;
    if (camera.x > currentLevel.width - canvas.width) camera.x = currentLevel.width - canvas.width;

    updateEnemies();
    updateParticles();
}

function updateParticles() {
    stats.particleCount = particles.length;
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
    
    // Goal
    ctx.fillStyle = goal.color;
    ctx.fillRect(goal.x, goal.y, goal.width, goal.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(goal.x + 5, goal.y + 5, goal.width - 10, goal.height/2);

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

    for (const en of enemies) {
        ctx.fillStyle = en.color;
        ctx.fillRect(en.x, en.y, en.width, en.height);
    }

    for (const p of particles) {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1.0;

    if (player.alive && !goal.reached) {
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);
        ctx.fillStyle = player.eyeColor;
        const eyeOffset = player.vx >= 0 ? 18 : 5;
        ctx.fillRect(player.x + eyeOffset, player.y + 8, 5, 5);
        ctx.fillRect(player.x + eyeOffset + 4, player.y + 8, 5, 5);
    }
    
    ctx.restore();

    if (goal.reached) {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('NIVEAU COMPLÉTÉ !', canvas.width/2, canvas.height/2);
        ctx.font = '24px Arial';
        ctx.fillText('Appuyez sur Entrée pour le niveau suivant', canvas.width/2, canvas.height/2 + 60);
    }

    // Debug UI
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(5, 5, 200, 80);
    ctx.fillStyle = 'white';
    ctx.font = '14px monospace';
    ctx.fillText(`FPS: ${stats.fps} | Particles: ${stats.particleCount}`, 15, 25);
    ctx.fillText(`Level: ${currentLevelIndex + 1}`, 15, 45);
    ctx.fillText(`Total Wins: ${player.totalWins}`, 15, 65);
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// Start
loadGame(); // Expert Engine: Load on startup
initLevel(currentLevelIndex);
loop();
console.log("Système de sauvegarde activé.");