// main.js - Point d'entrée et orchestration
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

const stats = { fps: 0, lastTime: performance.now(), frameCount: 0 };
let currentLevelIndex = 0;
let gameState = 'START';
let levelTimer = 0;
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
}

function update() {
    if (gameState !== 'PLAYING') return;
    
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

    updatePhysics(player, levels[currentLevelIndex].platforms, wasGrounded);
    updateEnemies(player, enemies, particles, sfx, takeDamage, killPlayer);
    updateCoins(player, coins, createParticles, sfx);
    updateParticles();

    camera.x += (player.x - canvas.width / 2 - camera.x) * 0.1;
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
    // draw logic here or in render.js
    drawBackground(ctx, canvas, camera, clouds, mountains);
    drawPlayer(ctx, player);
    requestAnimationFrame(loop);
}

initLevel(0);
loop();
