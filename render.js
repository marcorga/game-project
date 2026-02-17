// render.js - Systèmes visuels et dessin
const particles = [];
const clouds = [];
const mountains = [];
const decorations = [];
const MAX_PARTICLES = 200;

const colors = {
    ground: '#4a2c2a',
    grass: '#2d5a27',
    sky: '#87CEEB',
    dust: '#FFF',
    coin: '#FFD700',
    platformSide: '#5D2E0C',
    platformTop: '#8B4513'
};

function createParticles(x, y, color, count) {
    const spaceLeft = MAX_PARTICLES - particles.length;
    const actualCount = Math.min(count, spaceLeft);
    for (let i = 0; i < actualCount; i++) {
        particles.push({
            x: x, y: y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            size: Math.random() * 5 + 2,
            life: 1.0,
            color: color
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        if (p.life <= 0) particles.splice(i, 1);
    }
}

function drawBackground(ctx, canvas, camera, clouds, mountains) {
    ctx.fillStyle = colors.sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(-Math.floor(camera.x * 0.1), 0);
    for (const mt of mountains) {
        ctx.fillStyle = mt.color;
        ctx.beginPath();
        ctx.moveTo(mt.x, canvas.height);
        ctx.lineTo(mt.x + mt.width / 2, canvas.height - mt.height);
        ctx.lineTo(mt.x + mt.width, canvas.height);
        ctx.fill();
    }
    ctx.restore();

    ctx.save();
    ctx.translate(-Math.floor(camera.x * 0.3), 0);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    for (const cloud of clouds) {
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.size * 0.5, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.size * 0.3, cloud.y - cloud.size * 0.2, cloud.size * 0.4, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.size * 0.6, cloud.y, cloud.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}

function drawGameObjects(ctx, camera, platforms, decorations, enemies, coins, items, goal, player) {
    ctx.save();
    ctx.translate(-Math.floor(camera.x), 0);

    // Goal
    ctx.fillStyle = goal.color;
    ctx.fillRect(goal.x, goal.y, goal.width, goal.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(goal.x + 5, goal.y + 5, goal.width - 10, goal.height/2);

    // Decorations
    for (const dec of decorations) {
        if (dec.type === 'bush') {
            ctx.fillStyle = '#1e3d1a';
            ctx.beginPath();
            ctx.arc(dec.x, dec.y, dec.size * 0.4, Math.PI, 0);
            ctx.arc(dec.x + dec.size * 0.4, dec.y, dec.size * 0.5, Math.PI, 0);
            ctx.arc(dec.x + dec.size * 0.8, dec.y, dec.size * 0.4, Math.PI, 0);
            ctx.fill();
        } else if (dec.type === 'tree') {
            ctx.fillStyle = '#3d2616';
            ctx.fillRect(dec.x + dec.size * 0.3, dec.y - dec.size, dec.size * 0.2, dec.size);
            ctx.fillStyle = '#2d5a27';
            ctx.beginPath();
            ctx.moveTo(dec.x, dec.y - dec.size * 0.8);
            ctx.lineTo(dec.x + dec.size * 0.4, dec.y - dec.size * 1.8);
            ctx.lineTo(dec.x + dec.size * 0.8, dec.y - dec.size * 0.8);
            ctx.fill();
        }
    }

    // Platforms
    for (const plat of platforms) {
        if (plat.type === 'ground') {
            ctx.fillStyle = colors.ground;
            ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
            ctx.fillStyle = colors.grass;
            ctx.fillRect(plat.x, plat.y, plat.width, 10);
        } else {
            ctx.fillStyle = colors.platformTop;
            ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
            ctx.strokeStyle = colors.platformSide;
            ctx.strokeRect(plat.x, plat.y, plat.width, plat.height);
        }
    }

    // Enemies
    for (const en of enemies) {
        ctx.fillStyle = en.color;
        ctx.fillRect(en.x, en.y, en.width, en.height);
    }

    // Coins
    for (const coin of coins) {
        if (!coin.collected) {
            ctx.fillStyle = colors.coin;
            ctx.beginPath();
            ctx.arc(coin.x + 10, coin.y + 10, 8, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Items
    for (const item of items) {
        if (!item.collected && item.type === 'heart') {
            const y = item.y + Math.sin(item.bob) * 5;
            ctx.fillStyle = '#FF0000';
            ctx.beginPath();
            ctx.moveTo(item.x + 12, y + 20);
            ctx.bezierCurveTo(item.x - 5, y + 10, item.x + 5, y - 5, item.x + 12, y + 5);
            ctx.bezierCurveTo(item.x + 19, y - 5, item.x + 29, y + 10, item.x + 12, y + 20);
            ctx.fill();
        }
    }

    // Particles
    for (const p of particles) {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1.0;

    // Player
    if (player.alive && (player.invincible % 4 < 2)) {
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);
        ctx.fillStyle = player.eyeColor;
        const eyeOffset = player.vx >= 0 ? 18 : 5;
        ctx.fillRect(player.x + eyeOffset, player.y + 8, 5, 5);
        ctx.fillRect(player.x + eyeOffset + 4, player.y + 8, 5, 5);
    }

    ctx.restore();
}

function drawUI(ctx, canvas, player, currentLevelIndex, levelTimer, stats, goal, camera, gameState) {
    if (gameState === 'START') {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.font = 'bold 48px Arial';
        ctx.fillText('SUPER PLATFORMER', canvas.width/2, canvas.height/2 - 50);
        ctx.font = '24px Arial';
        ctx.fillText('Appuyez sur ESPACE pour commencer', canvas.width/2, canvas.height/2 + 20);
        return;
    }

    // HUD
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(10, 10, 200, 120);
    ctx.fillStyle = 'white';
    ctx.font = '14px monospace';
    ctx.fillText(`FPS: ${stats.fps}`, 20, 30);
    ctx.fillText(`Niveau: ${currentLevelIndex + 1}`, 20, 50);
    ctx.fillText(`Temps: ${levelTimer}s`, 20, 70);
    ctx.fillText(`PV: ${player.hp}/${player.maxHp}`, 20, 90);
    ctx.fillText(`Pièces: ${player.totalCoins}`, 20, 110);

    // Progress Bar
    const progress = Math.min(player.x / 1500, 1); // Simplifié
    ctx.fillStyle = 'gray';
    ctx.fillRect(20, 120, 180, 5);
    ctx.fillStyle = '#00FF00';
    ctx.fillRect(20, 120, 180 * progress, 5);

    if (gameState === 'GAMEOVER') {
        ctx.fillStyle = 'rgba(255,0,0,0.4)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.font = 'bold 64px Arial';
        ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2);
    }

    if (goal.reached) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#FFD700';
        ctx.textAlign = 'center';
        ctx.font = 'bold 48px Arial';
        ctx.fillText('NIVEAU COMPLÉTÉ !', canvas.width/2, canvas.height/2);
    }
}
