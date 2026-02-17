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

function drawPlayer(ctx, player) {
    if (player.invincible % 4 < 2) {
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);
        ctx.fillStyle = player.eyeColor;
        const eyeOffset = player.vx >= 0 ? 18 : 5;
        ctx.fillRect(player.x + eyeOffset, player.y + 8, 5, 5);
        ctx.fillRect(player.x + eyeOffset + 4, player.y + 8, 5, 5);
    }
}

function drawBackground(ctx, canvas, camera, clouds, mountains) {
    ctx.fillStyle = colors.sky;
    ctx.fillRect(camera.x, 0, canvas.width, canvas.height);
    
    // Mountains Parallax
    for (const mt of mountains) {
        const px = (mt.x - camera.x * 0.1);
        ctx.fillStyle = mt.color;
        ctx.beginPath();
        ctx.moveTo(px, canvas.height);
        ctx.lineTo(px + mt.width / 2, canvas.height - mt.height);
        ctx.lineTo(px + mt.width, canvas.height);
        ctx.fill();
    }

    // Clouds Parallax
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    for (const cloud of clouds) {
        const parallaxX = (cloud.x - camera.x * 0.3);
        ctx.beginPath();
        ctx.arc(parallaxX, cloud.y, cloud.size * 0.5, 0, Math.PI * 2);
        ctx.arc(parallaxX + cloud.size * 0.3, cloud.y - cloud.size * 0.2, cloud.size * 0.4, 0, Math.PI * 2);
        ctx.arc(parallaxX + cloud.size * 0.6, cloud.y, cloud.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
    }
}
