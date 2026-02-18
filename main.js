// main.js - Point d'entrée et orchestration
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

const stats = { fps: 0, lastTime: performance.now(), frameCount: 0, particleCount: 0 };
let currentLevelIndex = 0;
let gameState = 'START';
let levelTimer = 0;
let lastTimerUpdate = 0;
const camera = { x: 0, y: 0 };
const goal = { x: 0, y: 0, width: 0, height: 0, color: '#FF00FF', reached: false };
const keys = {};

window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);

function initLevel(index) {
    const level = levels[index % levels.length];
    currentLevelIndex = index % levels.length;
    
    player.reset(50, 50, player.maxHp);
    
    goal.x = level.goal.x; goal.y = level.goal.y;
    goal.width = level.goal.width; goal.height = level.goal.height;
    goal.reached = false;
    enemies.length = 0; level.enemies.forEach(en => enemies.push({...en}));
    coins.length = 0; level.coins.forEach(c => coins.push({...c, width: 20, height: 20, collected: false}));
    platforms.length = 0; level.platforms.forEach(p => platforms.push({...p}));
    items.length = 0;
    if (level.items) {
        level.items.forEach(it => {
            items.push({
                x: it.x, y: it.y, width: 24, height: 24, type: it.type, collected: false, bob: 0
            });
        });
    }
    levelTimer = level.timeLimit;
    lastTimerUpdate = performance.now();

    // Init visual elements (Modular)
    initVisuals(level, canvas.height);
}

function update() {
    // Stats FPS
    stats.frameCount++;
    const now = performance.now();
    if (now > stats.lastTime + 1000) {
        stats.fps = Math.round((stats.frameCount * 1000) / (now - stats.lastTime));
        stats.frameCount = 0;
        stats.lastTime = now;
    }

    if (gameState === 'START') {
        if (keys['Space'] || keys['Enter']) {
            gameState = 'PLAYING';
            startMusic();
        }
        return;
    }

    if (gameState === 'GAMEOVER') {
        if (keys['Space'] || keys['Enter']) {
            initLevel(currentLevelIndex);
            gameState = 'PLAYING';
        }
        return;
    }

    if (!player.alive || goal.reached) {
        updateParticles();
        if (goal.reached && (keys['Enter'] || keys['Space'])) {
            initLevel(currentLevelIndex + 1);
        }
        return;
    }

    // Timer
    if (now - lastTimerUpdate >= 1000) {
        levelTimer--;
        lastTimerUpdate = now;
        if (levelTimer <= 0) player.kill();
    }

    let wasGrounded = player.grounded;
    if (keys['ArrowLeft']) player.vx = -player.speed;
    else if (keys['ArrowRight']) player.vx = player.speed;
    else {
        player.vx *= 0.8; // friction
        if (Math.abs(player.vx) < 0.1) player.vx = 0;
    }

    if (keys['Space'] && player.grounded && !player.jumpPressed) {
        player.vy = player.jumpStrength;
        player.grounded = false;
        player.jumpPressed = true;
        createParticles(player.x + player.width/2, player.y + player.height, '#FFF', 8);
        sfx.jump();
    }
    if (!keys['Space']) player.jumpPressed = false;

    if (player.invincible > 0) player.invincible--;

    updatePhysics(player, platforms, wasGrounded);
    updateEnemies(player, enemies, particles, sfx, killPlayer);
    updateCoins(player, coins, createParticles, sfx);
    updateItems(player, items, createParticles, sfx);
    updateParticles();
    stats.particleCount = particles.length;

    // Goal Collision (Modular)
    checkGoal(player, goal, createParticles, sfx, updateLeaderboard, saveGame, currentLevelIndex);

    if (player.shakeTime > 0) player.shakeTime--;

    // Update Visuals (Modular)
    updateVisuals(levels[currentLevelIndex].width);

    camera.x += (player.x - canvas.width / 2 - camera.x) * 0.1;
    if (camera.x < 0) camera.x = 0;
    if (camera.x > levels[currentLevelIndex].width - canvas.width) camera.x = levels[currentLevelIndex].width - canvas.width;

    if (player.y > canvas.height + 100) player.kill();
}

function killPlayer() {
    player.kill();
    setTimeout(() => gameState = 'GAMEOVER', 800);
}

function loop() {
    update();

    let shakeX = 0;
    let shakeY = 0;
    if (player.shakeTime > 0) {
        shakeX = (Math.random() - 0.5) * player.shakeTime;
        shakeY = (Math.random() - 0.5) * player.shakeTime;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground(ctx, canvas, camera, clouds, mountains, shakeX, shakeY);
    drawGameObjects(ctx, camera, platforms, decorations, enemies, coins, items, goal, player, shakeX, shakeY);
    drawUI(ctx, canvas, player, currentLevelIndex, levelTimer, stats, goal, camera, gameState, leaderboard);
    requestAnimationFrame(loop);
}

const startLevelIndex = loadGame(player);
initLevel(startLevelIndex);
loop();
