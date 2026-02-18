// entities.js - Ennemis et Objets (Le Joueur a son propre module player.js)

const enemies = [];
const coins = [];
const items = [];
let platforms = [];

function updateEnemies(player, enemies, particles, sfx, killPlayer) {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const en = enemies[i];
        en.x += en.vx;
        if (Math.abs(en.x - en.startX) > en.range) en.vx *= -1;

        if (player.alive && player.invincible <= 0 &&
            player.x < en.x + en.width && player.x + player.width > en.x &&
            player.y < en.y + en.height && player.y + player.height > en.y) {
            
            if (player.vy > 0 && player.y + player.height - player.vy <= en.y) {
                if (typeof createParticles === 'function') createParticles(en.x + en.width/2, en.y + en.height/2, en.color, 15);
                enemies.splice(i, 1);
                player.vy = player.jumpStrength * 0.8;
                player.shakeTime = 5;
            } else {
                player.takeDamage();
            }
        }
    }
}

function updateCoins(player, coins, createParticles, sfx) {
    for (const coin of coins) {
        if (!coin.collected &&
            player.x < coin.x + coin.width && player.x + player.width > coin.x &&
            player.y < coin.y + coin.height && player.y + player.height > coin.y) {
            coin.collected = true;
            player.levelCoins++;
            player.totalCoins++;
            if (typeof createParticles === 'function') createParticles(coin.x + coin.width/2, coin.y + coin.height/2, '#FFD700', 10);
            player.shakeTime = 2;
            if (sfx) sfx.coin();
        }
    }
}
