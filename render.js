// render.js - Systèmes visuels et dessin
const particles = [];
const clouds = [];
const mountains = [];
const decorations = [];
const MAX_PARTICLES = 200;
let windTimer = 0;
const windSpeed = 0.002;

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

function initVisuals(level, canvasHeight) {
    // Init Clouds
    clouds.length = 0;
    for (let i = 0; i < 10; i++) {
        clouds.push({
            x: Math.random() * level.width,
            y: Math.random() * (canvasHeight / 2),
            speed: 0.2 + Math.random() * 0.5,
            size: 30 + Math.random() * 50
        });
    }

    // Init Mountains
    mountains.length = 0;
    for (let i = 0; i < 5; i++) {
        mountains.push({
            x: i * 400,
            width: 600 + Math.random() * 400,
            height: 100 + Math.random() * 200,
            color: `rgba(100, 130, 150, ${0.3 + Math.random() * 0.2})`
        });
    }

    // Init Decorations
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

function updateVisuals(levelWidth) {
    windTimer += windSpeed;
    // Update Clouds
    for (const cloud of clouds) {
        cloud.x -= cloud.speed;
        if (cloud.x + cloud.size < 0) cloud.x = levelWidth;
    }
}

function drawBackground(ctx, canvas, camera, clouds, mountains, shakeX = 0, shakeY = 0) {
    ctx.fillStyle = colors.sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(shakeX, shakeY);

    // Mountains Parallax (0.1)
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

    // Clouds Parallax (0.3)
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
                const grassWind = Math.sin(windTimer * 1000 + (plat.x + i) * 0.1) * 3;
                ctx.moveTo(plat.x + i, plat.y);
                ctx.lineTo(plat.x + i + (Math.random() - 0.5) * 5 + grassWind, plat.y - grassH);
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

function drawGameObjects(ctx, camera, platforms, decorations, enemies, coins, items, goal, player, shakeX = 0, shakeY = 0) {
    ctx.save();
    ctx.translate(-Math.floor(camera.x) + shakeX, shakeY);

    // Goal
    ctx.fillStyle = goal.color;
    ctx.fillRect(goal.x, goal.y, goal.width, goal.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(goal.x + 5, goal.y + 5, goal.width - 10, goal.height/2);

    // Decorations
    for (const dec of decorations) {
        const windOffset = Math.sin(windTimer * 1000 + dec.x * 0.05) * 2;
        if (dec.type === 'bush') {
            ctx.fillStyle = '#1e3d1a';
            ctx.beginPath();
            ctx.arc(dec.x + windOffset * 0.5, dec.y, dec.size * 0.4, Math.PI, 0);
            ctx.arc(dec.x + dec.size * 0.4 + windOffset, dec.y, dec.size * 0.5, Math.PI, 0);
            ctx.arc(dec.x + dec.size * 0.8 + windOffset * 0.5, dec.y, dec.size * 0.4, Math.PI, 0);
            ctx.fill();
        } else if (dec.type === 'tree') {
            ctx.fillStyle = '#3d2616';
            ctx.fillRect(dec.x + dec.size * 0.3, dec.y - dec.size, dec.size * 0.2, dec.size);
            ctx.fillStyle = '#2d5a27';
            ctx.beginPath();
            ctx.moveTo(dec.x + windOffset, dec.y - dec.size * 0.8);
            ctx.lineTo(dec.x + dec.size * 0.4 + windOffset * 1.5, dec.y - dec.size * 1.8);
            ctx.lineTo(dec.x + dec.size * 0.8 + windOffset, dec.y - dec.size * 0.8);
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
    drawPlayer(ctx, player);

    ctx.restore();
}

function drawPlayer(ctx, player) {
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
}
