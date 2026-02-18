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

function drawPlatforms(ctx, platforms) {
    for (const plat of platforms) {
        if (plat.type === 'ground') {
            ctx.fillStyle = colors.ground;
            ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
            ctx.fillStyle = colors.grass;
            ctx.fillRect(plat.x, plat.y, plat.width, 10);
            
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
            ctx.fillStyle = colors.platformTop;
            ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
            ctx.strokeStyle = colors.platformSide;
            ctx.lineWidth = 2;
            ctx.strokeRect(plat.x, plat.y, plat.width, plat.height);
            
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

    drawPlatforms(ctx, platforms);

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
            ctx.strokeStyle = '#B8860B';
            ctx.stroke();
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
        ctx.save();
        
        // Squash & Stretch Logic
        let stretchX = 1 + Math.abs(player.vx) * 0.05 - Math.abs(player.vy) * 0.02;
        let stretchY = 1 - Math.abs(player.vx) * 0.02 + Math.abs(player.vy) * 0.05;
        
        // Limiter le stretch
        stretchX = Math.max(0.7, Math.min(1.3, stretchX));
        stretchY = Math.max(0.7, Math.min(1.3, stretchY));

        ctx.translate(player.x + player.width / 2, player.y + player.height);
        
        // Inclinaison selon la vitesse horizontale
        const tilt = player.vx * 0.05;
        ctx.rotate(tilt);
        
        ctx.scale(stretchX, stretchY);

        ctx.fillStyle = player.color;
        ctx.fillRect(-player.width / 2, -player.height, player.width, player.height);

        // Yeux
        ctx.fillStyle = player.eyeColor;
        const eyeOffset = player.vx >= 0 ? 5 : -15;
        ctx.fillRect(eyeOffset, -player.height + 8, 5, 5);
        ctx.fillRect(eyeOffset + 7, -player.height + 8, 5, 5);

        ctx.restore();
    }

    ctx.restore();
}

function drawUI(ctx, canvas, player, currentLevelIndex, levelTimer, stats, goal, camera, gameState, leaderboard) {
    if (gameState === 'START') {
        ctx.fillStyle = colors.sky;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.font = 'bold 48px Arial';
        ctx.fillText('SUPER PLATFORMER', canvas.width/2, canvas.height/2 - 120);
        
        ctx.font = '24px Arial';
        ctx.fillText('ESPACE pour commencer', canvas.width/2, canvas.height/2 - 40);
        
        if (leaderboard && leaderboard.length > 0) {
            ctx.font = '20px Arial';
            ctx.fillText('LEADERBOARD', canvas.width/2, canvas.height/2 + 20);
            ctx.font = '16px Arial';
            leaderboard.forEach((entry, i) => {
                ctx.fillText(`${i+1}. ${entry.score} pièces (${entry.date})`, canvas.width/2, canvas.height/2 + 50 + (i * 20));
            });
        }
        return;
    }

    // HUD
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.fillRect(5, 5, 220, 140);
    ctx.fillStyle = 'white';
    ctx.font = '14px monospace';
    ctx.fillText(`FPS: ${stats.fps} | P: ${stats.particleCount || 0}`, 15, 25);
    ctx.fillText(`Niveau: ${currentLevelIndex + 1}`, 15, 45);
    ctx.fillText(`Temps: ${levelTimer}s`, 15, 60);
    ctx.fillText(`PV: ${player.hp}/${player.maxHp}`, 15, 80);
    ctx.fillText(`Pièces (Total): ${player.totalCoins}`, 15, 100);
    ctx.fillText(`Pièces (Niveau): ${player.levelCoins}`, 15, 120);

    // Progress Bar
    const progress = Math.min(player.x / 1500, 1);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(15, 130, 200, 10);
    ctx.fillStyle = '#00FF00';
    ctx.fillRect(15, 130, 200 * progress, 10);

    // Goal Arrow
    if (gameState === 'PLAYING' && player.alive && !goal.reached) {
        const dx = goal.x - player.x;
        const dy = goal.y - player.y;
        if (Math.sqrt(dx*dx + dy*dy) > 400) {
            const angle = Math.atan2(dy, dx);
            ctx.save();
            ctx.translate(player.x - camera.x + 15 + Math.cos(angle)*60, player.y + 15 + Math.sin(angle)*60);
            ctx.rotate(angle);
            ctx.fillStyle = 'rgba(255, 255, 0, 0.7)';
            ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(-5, -7); ctx.lineTo(-5, 7); ctx.closePath(); ctx.fill();
            ctx.restore();
        }
    }

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
