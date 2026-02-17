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
            { x: 300, y: 350, width: 120, height: 20, type: 'platform' }, // Un peu plus large pour aider
            { x: 520, y: 260, width: 100, height: 20, type: 'platform' }, // Ajusté position
            { x: 750, y: 250, width: 150, height: 20, type: 'platform' },
            { x: 1000, y: 350, width: 100, height: 20, type: 'platform' },
            { x: 1200, y: 450, width: 100, height: 20, type: 'platform' },
            { x: 1450, y: 350, width: 150, height: 20, type: 'platform' }
        ],
        enemies: [
            { x: 200, y: 520, width: 30, height: 30, color: '#FF4444', vx: 1.5, range: 80, startX: 200 }, // Ralenti
            { x: 800, y: 520, width: 30, height: 30, color: '#FF4444', vx: 3, range: 150, startX: 800 }, // Un peu plus lent
            { x: 1400, y: 520, width: 30, height: 30, color: '#FF4444', vx: 2.5, range: 100, startX: 1400 },
            { x: 750, y: 220, width: 30, height: 30, color: '#FF4444', vx: 1.5, range: 40, startX: 750 } // Ralenti sur plateforme
        ],
        coins: [
            { x: 150, y: 400 }, { x: 350, y: 300 }, { x: 550, y: 200 }, { x: 825, y: 200 }, { x: 1500, y: 300 }
        ],
        goal: { x: 1700, y: 470, width: 40, height: 80 }
    }
];

let currentLevelIndex = 0;
let leaderboard = [];
let levelTimer = 0;

// --- SAVE SYSTEM ---
function saveGame() {
    const saveData = {
        totalWins: player.totalWins,
        currentLevel: currentLevelIndex,
        totalCoins: player.totalCoins,
        leaderboard: leaderboard
    };
    localStorage.setItem('platformer_save', JSON.stringify(saveData));
}

function loadGame() {
    const saved = localStorage.getItem('platformer_save');
    if (saved) {
        const data = JSON.parse(saved);
        player.totalWins = data.totalWins || 0;
        currentLevelIndex = data.currentLevel || 0;
        player.totalCoins = data.totalCoins || 0;
        leaderboard = data.leaderboard || [];
    }
}

function updateLeaderboard(score) {
    leaderboard.push({ score: score, date: new Date().toLocaleDateString() });
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 5); // Garder le top 5
    saveGame();
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
    hp: 3,
    maxHp: 3,
    invincible: 0,
    totalWins: 0,
    totalCoins: 0,
    levelCoins: 0,
    shakeTime: 0
};

const particles = [];
const clouds = []; // Expert VFX: Ambiance
const MAX_PARTICLES = 200;

let currentLevel = null;
let enemies = [];
let platforms = [];
let coins = [];
const goal = { x: 0, y: 0, width: 0, height: 0, color: '#FF00FF', reached: false };
const camera = { x: 0, y: 0 };

let gameState = 'START'; // START, PLAYING, WIN, GAMEOVER

function initLevel(index) {
    currentLevelIndex = index % levels.length;
    currentLevel = levels[currentLevelIndex];
    player.x = 50;
    player.y = 50;
    player.vx = 0;
    player.vy = 0;
    player.alive = true;
    player.hp = player.maxHp;
    player.invincible = 0;
    player.levelCoins = 0;
    platforms = currentLevel.platforms;
    goal.x = currentLevel.goal.x;
    goal.y = currentLevel.goal.y;
    goal.width = currentLevel.goal.width;
    goal.height = currentLevel.goal.height;
    goal.reached = false;
    enemies = currentLevel.enemies.map(en => ({ ...en }));
    coins = currentLevel.coins.map(c => ({ ...c, width: 20, height: 20, collected: false }));
    levelTimer = currentLevel.timeLimit;

    // Expert VFX: Init Clouds
    clouds.length = 0;
    for (let i = 0; i < 10; i++) {
        clouds.push({
            x: Math.random() * currentLevel.width,
            y: Math.random() * (canvas.height / 2),
            speed: 0.2 + Math.random() * 0.5,
            size: 30 + Math.random() * 50
        });
    }

    saveGame();
}

// --- SYSTEMS ---

// Expert VFX: Simple Web Audio SFX Engine
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, type, duration, volume = 0.1) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    
    gain.gain.setValueAtTime(volume, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

const sfx = {
    jump: () => playTone(400, 'square', 0.1),
    coin: () => {
        playTone(800, 'sine', 0.1);
        setTimeout(() => playTone(1200, 'sine', 0.1), 50);
    },
    death: () => {
        playTone(200, 'sawtooth', 0.3);
        playTone(150, 'sawtooth', 0.3);
    },
    hit: () => {
        playTone(300, 'triangle', 0.2);
    },
    win: () => {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((f, i) => {
            setTimeout(() => playTone(f, 'triangle', 0.2, 0.15), i * 100);
        });
    }
};

function createParticles(x, y, color, count) {
    const spaceLeft = MAX_PARTICLES - particles.length;
    const actualCount = Math.min(count, spaceLeft);
    for (let i = 0; i < actualCount; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            size: Math.random() * 5 + 2,
            life: 1.0,
            color: color
        });
    }
}

function updateCoins() {
    for (const coin of coins) {
        if (!coin.collected &&
            player.x < coin.x + coin.width &&
            player.x + player.width > coin.x &&
            player.y < coin.y + coin.height &&
            player.y + player.height > coin.y) {
            
            coin.collected = true;
            player.levelCoins++;
            player.totalCoins++;
            createParticles(coin.x + coin.width/2, coin.y + coin.height/2, '#FFD700', 10);
            player.shakeTime = 2;
            sfx.coin();
        }
    }
}

function updateEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const en = enemies[i];
        en.x += en.vx;
        if (Math.abs(en.x - en.startX) > en.range) {
            en.vx *= -1;
        }

        if (player.alive && !goal.reached && player.invincible <= 0 &&
            player.x < en.x + en.width &&
            player.x + player.width > en.x &&
            player.y < en.y + en.height &&
            player.y + player.height > en.y) {
            
            if (player.vy > 0 && player.y + player.height - player.vy <= en.y) {
                createParticles(en.x + en.width/2, en.y + en.height/2, en.color, 15);
                enemies.splice(i, 1);
                player.vy = player.jumpStrength * 0.8;
                player.shakeTime = 5;
            } else {
                takeDamage();
            }
        }
    }
}

function takeDamage() {
    player.hp--;
    player.shakeTime = 10;
    player.invincible = 60; // 1 seconde à 60fps
    createParticles(player.x + player.width/2, player.y + player.height/2, '#FF0000', 10);
    sfx.hit();
    if (player.hp <= 0) {
        killPlayer();
    }
}

function killPlayer() {
    player.alive = false;
    player.shakeTime = 15;
    createParticles(player.x + player.width/2, player.y + player.height/2, player.color, 25);
    sfx.death();
    setTimeout(() => {
        gameState = 'GAMEOVER';
    }, 800);
}

const gravity = 0.5;
const friction = 0.8;
const colors = {
    ground: '#4a2c2a',
    grass: '#2d5a27',
    sky: '#87CEEB',
    dust: '#FFF',
    coin: '#FFD700',
    platformSide: '#5D2E0C',
    platformTop: '#8B4513'
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

    if (gameState === 'START') {
        if (keys['Enter'] || keys['Space']) {
            gameState = 'PLAYING';
            stats.lastTimerUpdate = performance.now();
        }
        return;
    }

    if (gameState === 'GAMEOVER') {
        if (keys['Enter'] || keys['Space']) {
            initLevel(currentLevelIndex);
            gameState = 'PLAYING';
            stats.lastTimerUpdate = performance.now();
        }
        return;
    }

    // Timer Update
    const currentTime = performance.now();
    if (!stats.lastTimerUpdate) stats.lastTimerUpdate = currentTime;
    if (currentTime - stats.lastTimerUpdate >= 1000) {
        levelTimer--;
        stats.lastTimerUpdate = currentTime;
        if (levelTimer <= 0) {
            levelTimer = 0;
            killPlayer();
        }
    }

    if (player.shakeTime > 0) player.shakeTime--;
    if (player.invincible > 0) player.invincible--;

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
            sfx.jump();
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
                    if (player.vy > 5) player.shakeTime = 3;
                }
            } else if (player.vy < 0 && (player.y - player.vy) >= (plat.y + plat.height)) {
                player.y = plat.y + plat.height;
                player.vy = 0;
            }
        }
    }

    if (player.x < goal.x + goal.width &&
        player.x + player.width > goal.x &&
        player.y < goal.y + goal.height &&
        player.y + player.height > goal.y) {
        goal.reached = true;
        player.totalWins++;
        player.shakeTime = 20;
        createParticles(goal.x + goal.width/2, goal.y + goal.height/2, '#FFFF00', 50);
        sfx.win();
        updateLeaderboard(player.levelCoins); // Enregistrer le score du niveau
        saveGame();
    }

    if (player.y > canvas.height + 100) killPlayer();
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > currentLevel.width) player.x = currentLevel.width - player.width;
    
    let targetCameraX = player.x - canvas.width / 2;
    camera.x += (targetCameraX - camera.x) * 0.1;
    if (camera.x < 0) camera.x = 0;
    if (camera.x > currentLevel.width - canvas.width) camera.x = currentLevel.width - canvas.width;

    updateEnemies();
    updateCoins();
    updateParticles();

    // Expert VFX: Update Clouds
    for (const cloud of clouds) {
        cloud.x -= cloud.speed;
        if (cloud.x + cloud.size < 0) {
            cloud.x = currentLevel.width;
        }
    }
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
    
    if (gameState === 'START') {
        ctx.fillStyle = colors.sky;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.font = 'bold 48px Arial';
        ctx.fillText('SUPER PLATFORMER', canvas.width/2, canvas.height/2 - 120);
        
        ctx.font = '24px Arial';
        ctx.fillText('Appuyez sur ENTRÉE pour commencer', canvas.width/2, canvas.height/2 - 40);
        
        ctx.font = '20px Arial';
        ctx.fillText('LEADERBOARD (Pièces)', canvas.width/2, canvas.height/2 + 20);
        ctx.font = '16px Arial';
        leaderboard.forEach((entry, i) => {
            ctx.fillText(`${i+1}. ${entry.score} pièces (${entry.date})`, canvas.width/2, canvas.height/2 + 50 + (i * 20));
        });

        ctx.font = '16px Arial';
        ctx.fillText('Flèches pour bouger • Espace pour sauter', canvas.width/2, canvas.height/2 + 180);
        return;
    }

    let shakeX = 0;
    let shakeY = 0;
    if (player.shakeTime > 0) {
        shakeX = (Math.random() - 0.5) * player.shakeTime;
        shakeY = (Math.random() - 0.5) * player.shakeTime;
    }

    ctx.save();
    ctx.translate(-Math.floor(camera.x) + shakeX, shakeY);

    ctx.fillStyle = colors.sky;
    ctx.fillRect(Math.floor(camera.x) - shakeX, -shakeY, canvas.width, canvas.height);
    
    // Expert VFX: Draw Clouds (Parallax-ish)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    for (const cloud of clouds) {
        // Simple cloud shape with 3 circles
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.size * 0.5, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.size * 0.3, cloud.y - cloud.size * 0.2, cloud.size * 0.4, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.size * 0.6, cloud.y, cloud.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.fillStyle = goal.color;
    ctx.fillRect(goal.x, goal.y, goal.width, goal.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(goal.x + 5, goal.y + 5, goal.width - 10, goal.height/2);

    for (const plat of platforms) {
        if (plat.type === 'ground') {
            // Sol avec texture de terre et herbe détaillée
            ctx.fillStyle = colors.ground;
            ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
            ctx.fillStyle = colors.grass;
            ctx.fillRect(plat.x, plat.y, plat.width, 10);
            
            // Petits brins d'herbe aléatoires
            ctx.beginPath();
            ctx.strokeStyle = colors.grass;
            ctx.lineWidth = 2;
            for (let i = 0; i < plat.width; i += 15) {
                const grassH = 5 + Math.random() * 5;
                ctx.moveTo(plat.x + i, plat.y);
                ctx.lineTo(plat.x + i + (Math.random() - 0.5) * 5, plat.y - grassH);
            }
            ctx.stroke();
        } else {
            // Plateformes volantes avec "veines" et ombres
            ctx.fillStyle = colors.platformTop;
            ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
            
            // Bordure
            ctx.strokeStyle = colors.platformSide;
            ctx.lineWidth = 2;
            ctx.strokeRect(plat.x, plat.y, plat.width, plat.height);
            
            // Texture interne (lignes horizontales subtiles)
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(0,0,0,0.15)';
            ctx.lineWidth = 1;
            for (let j = 4; j < plat.height; j += 6) {
                ctx.moveTo(plat.x + 2, plat.y + j);
                ctx.lineTo(plat.x + plat.width - 2, plat.y + j);
            }
            ctx.stroke();
        }
    }

    for (const en of enemies) {
        ctx.fillStyle = en.color;
        ctx.fillRect(en.x, en.y, en.width, en.height);
    }

    // Expert Creative: Draw Coins
    for (const coin of coins) {
        if (!coin.collected) {
            ctx.fillStyle = colors.coin;
            ctx.beginPath();
            ctx.arc(coin.x + 10, coin.y + 10, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#B8860B';
            ctx.stroke();
        }
    }

    for (const p of particles) {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1.0;

    if (player.alive && !goal.reached) {
        if (player.invincible % 4 < 2) { // Effet de clignotement
            ctx.fillStyle = player.color;
            ctx.fillRect(player.x, player.y, player.width, player.height);
            ctx.fillStyle = player.eyeColor;
            const eyeOffset = player.vx >= 0 ? 18 : 5;
            ctx.fillRect(player.x + eyeOffset, player.y + 8, 5, 5);
            ctx.fillRect(player.x + eyeOffset + 4, player.y + 8, 5, 5);
        }
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
        ctx.fillText(`Pièces récoltées : ${player.levelCoins}`, canvas.width/2, canvas.height/2 + 40);
        ctx.fillText('Appuyez sur Entrée pour le niveau suivant', canvas.width/2, canvas.height/2 + 80);
    }

    if (gameState === 'GAMEOVER') {
        ctx.fillStyle = 'rgba(255,0,0,0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.font = 'bold 64px Arial';
        ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2);
        ctx.font = '24px Arial';
        ctx.fillText('Appuyez sur ENTRÉE pour réessayer', canvas.width/2, canvas.height/2 + 60);
    }

    // Expert Creative: Improved UI
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(5, 5, 220, 100);
    ctx.fillStyle = 'white';
    ctx.font = '14px monospace';
    ctx.fillText(`FPS: ${stats.fps} | Particules: ${stats.particleCount}`, 15, 25);
    ctx.fillText(`Niveau: ${currentLevelIndex + 1}`, 15, 45);
    ctx.fillText(`Temps: ${levelTimer}s`, 15, 60);
    ctx.fillText(`PV: ${player.hp}/${player.maxHp}`, 15, 80);
    ctx.fillText(`Pièces (Total): ${player.totalCoins}`, 15, 100);
    ctx.fillText(`Pièces (Niveau): ${player.levelCoins}`, 15, 120);

    // Expert Creative: Level Progress Bar
    const barWidth = 200;
    const barHeight = 10;
    const barX = 15;
    const barY = 135;
    const progress = Math.min(player.x / currentLevel.width, 1);
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    ctx.fillStyle = '#00FF00';
    ctx.fillRect(barX, barY, barWidth * progress, barHeight);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loadGame();
initLevel(currentLevelIndex);
loop();
console.log("Système de Collectables (Pièces) initialisé.");