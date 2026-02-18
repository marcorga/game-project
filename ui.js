// ui.js - Gestion des entrées utilisateur et des interfaces
const keys = {};

// État du Combo
const comboState = {
    count: 0,
    multiplier: 1,
    timer: 0,
    maxTimer: 2.5,
    visualScale: 1
};

function initInputs() {
    window.addEventListener('keydown', e => keys[e.code] = true);
    window.addEventListener('keyup', e => keys[e.code] = false);
}

function updateCombo(delta) {
    if (comboState.timer > 0) {
        comboState.timer -= delta;
        if (comboState.timer <= 0) {
            comboState.count = 0;
            comboState.multiplier = 1;
            comboState.timer = 0;
        }
    }
    // Animation de réduction de l'échelle visuelle
    if (comboState.visualScale > 1) {
        comboState.visualScale -= delta * 2;
        if (comboState.visualScale < 1) comboState.visualScale = 1;
    }
}

function triggerCombo() {
    comboState.count++;
    comboState.multiplier = 1 + Math.floor(comboState.count / 3); // x1, x1, x2, x2, x2, x3...
    comboState.timer = comboState.maxTimer;
    comboState.visualScale = 1.5; // Effet de pop
}

function handlePlayerInput(player, sfx, createParticles) {
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
}

function handleGameStateTransitions(gameState, currentLevelIndex, initLevel, startMusic) {
    if (gameState === 'START') {
        if (keys['Space'] || keys['Enter']) {
            startMusic();
            return 'PLAYING';
        }
    }

    if (gameState === 'GAMEOVER') {
        if (keys['Space'] || keys['Enter']) {
            initLevel(currentLevelIndex);
            return 'PLAYING';
        }
    }

    return gameState;
}

function drawUI(ctx, canvas, player, currentLevelIndex, levelTimer, stats, goal, camera, gameState, leaderboard, colors) {
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

    // Combo Display
    if (comboState.multiplier > 1) {
        ctx.save();
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFD700';
        ctx.font = `bold ${Math.floor(20 * comboState.visualScale)}px Arial`;
        ctx.shadowColor = 'black';
        ctx.shadowBlur = 4;
        ctx.fillText(`x${comboState.multiplier} COMBO`, 110, 155);
        
        // Timer bar for combo
        const timerWidth = (comboState.timer / comboState.maxTimer) * 100;
        ctx.fillStyle = 'rgba(255, 215, 0, 0.5)';
        ctx.fillRect(60, 165, timerWidth, 5);
        ctx.restore();
    }

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
