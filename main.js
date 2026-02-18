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

    // Re-init visual elements
    clouds.length = 0;
    for (let i = 0; i < 10; i++) {
        clouds.push({
            x: Math.random() * level.width,
            y: Math.random() * (canvas.height / 2),
            speed: 0.2 + Math.random() * 0.5,
            size: 30 + Math.random() * 50
        });
    }

    mountains.length = 0;
    for (let i = 0; i < 5; i++) {
        mountains.push({
            x: i * 400,
            width: 600 + Math.random() * 400,
            height: 100 + Math.random() * 200,
            color: `rgba(100, 130, 150, ${0.3 + Math.random() * 0.2})`
        });
    }

    decorations.length = 0;
    level.platforms.forEach(plat => {
        const count = Math.floor(plat.width / 100);
        for (let i = 0; i < count; i++) {
            if (Math.random() > 0.4) {
                decorations.push({
                    x: plat.x + Math.random() * (plat.width - 20),
                    y: plat.y,
                    type: Math.random() > 0.5 ? 'tree' : 'bush',
                    size: 20 + Math.random() * 20
                });
            }
        }
    });
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
        if (levelTimer <= 0) killPlayer();
    }

    let wasGrounded = player.grounded;
    if (keys['ArrowLeft']) player.vx = -player.speed;
    else if (keys['ArrowRight']) player.vx = player.speed;
    else player.vx *= friction;

    if (keys['Space'] && player.grounded && !player.jumpPressed) {
        player.vy = player.jumpStrength;
        player.grounded = false;
        player.jumpPressed = true;
        sfx.jump();
    }
    if (!keys['Space']) player.jumpPressed = false;

    if (player.invincible > 0) player.invincible--;

    updatePhysics(player, levels[currentLevelIndex].platforms, wasGrounded);
    updateEnemies(player, enemies, particles, sfx, takeDamage, killPlayer);
    updateCoins(player, coins, createParticles, sfx);
    updateItems();
    updateParticles();

    // Goal Collision
    if (player.x < goal.x + goal.width &&
        player.x + player.width > goal.x &&
        player.y < goal.y + goal.height &&
        player.y + player.height > goal.y) {
        goal.reached = true;
        player.totalWins++;
        player.shakeTime = 20;
        createParticles(goal.x + goal.width/2, goal.y + goal.height/2, '#FFFF00', 50);
        sfx.win();
        updateLeaderboard(player.levelCoins);
        saveGame(player, currentLevelIndex);
    }

    if (player.shakeTime > 0) player.shakeTime--;

    // Update Clouds
    for (const cloud of clouds) {
        cloud.x -= cloud.speed;
        if (cloud.x + cloud.size < 0) cloud.x = levels[currentLevelIndex].width;
    }

    camera.x += (player.x - canvas.width / 2 - camera.x) * 0.1;
    if (camera.x < 0) camera.x = 0;
    if (camera.x > levels[currentLevelIndex].width - canvas.width) camera.x = levels[currentLevelIndex].width - canvas.width;

    if (player.y > canvas.height + 100) killPlayer();
}

function updateItems() {
    for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        item.bob += 0.1;
        if (!item.collected &&
            player.x < item.x + item.width &&
            player.x + player.width > item.x &&
            player.y < item.y + item.height + Math.sin(item.bob) * 5 &&
            player.y + player.height > item.y + Math.sin(item.bob) * 5) {
            item.collected = true;
            if (item.type === 'heart') {
                player.hp = Math.min(player.hp + 1, player.maxHp);
                createParticles(item.x + item.width/2, item.y + item.height/2, '#FF0000', 15);
                sfx.hit();
            }
        }
    }
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
    drawGameObjects(ctx, camera, platforms, decorations, enemies, coins, items, goal, player);
    drawUI(ctx, canvas, player, currentLevelIndex, levelTimer, stats, goal, camera, gameState, leaderboard);
    requestAnimationFrame(loop);
}

const startLevelIndex = loadGame(player);
initLevel(startLevelIndex);
loop();
