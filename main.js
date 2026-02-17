// main.js - Point d'entrée et orchestration
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

const stats = { fps: 0, lastTime: performance.now(), frameCount: 0 };
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
    player.x = 50; player.y = 50; player.alive = true;
    player.hp = player.maxHp; player.invincible = 0;
    goal.x = level.goal.x; goal.y = level.goal.y;
    goal.width = level.goal.width; goal.height = level.goal.height;
    goal.reached = false;
    enemies.length = 0; level.enemies.forEach(en => enemies.push({...en}));
    coins.length = 0; level.coins.forEach(c => coins.push({...c, width: 20, height: 20, collected: false}));
    levelTimer = level.timeLimit;
    lastTimerUpdate = performance.now();
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
        return;
    }

    // Timer
    if (now - lastTimerUpdate >= 1000) {
        levelTimer--;
        lastTimerUpdate = now;
        if (levelTimer <= 0) killPlayer();
    }

    let wasGrounded = player.grounded;
    if (keys['ArrowLeft']) player.vx = -player.speed;
    else if (keys['ArrowRight']) player.vx = player.speed;
    else player.vx *= friction;

    if (keys['Space'] && player.grounded && !player.jumpPressed) {
        player.vy = player.jumpStrength;
        player.jumpPressed = true;
        sfx.jump();
    }
    if (!keys['Space']) player.jumpPressed = false;

    if (player.invincible > 0) player.invincible--;

    updatePhysics(player, levels[currentLevelIndex].platforms, wasGrounded);
    updateEnemies(player, enemies, particles, sfx, takeDamage, killPlayer);
    updateCoins(player, coins, createParticles, sfx);
    updateParticles();

    camera.x += (player.x - canvas.width / 2 - camera.x) * 0.1;
    if (camera.x < 0) camera.x = 0;
    if (camera.x > levels[currentLevelIndex].width - canvas.width) camera.x = levels[currentLevelIndex].width - canvas.width;

    if (player.y > canvas.height + 100) killPlayer();
}

function takeDamage() {
    player.hp--; player.invincible = 60;
    sfx.hit();
    if (player.hp <= 0) killPlayer();
}

function killPlayer() {
    player.alive = false;
    sfx.death();
    setTimeout(() => gameState = 'GAMEOVER', 800);
}

function loop() {
    update();
    drawBackground(ctx, canvas, camera, clouds, mountains);
    drawGameObjects(ctx, camera, levels[currentLevelIndex].platforms, decorations, enemies, coins, items, goal, player);
    drawUI(ctx, canvas, player, currentLevelIndex, levelTimer, stats, goal, camera, gameState);
    requestAnimationFrame(loop);
}

initLevel(0);
loop();
