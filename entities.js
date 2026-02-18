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

function updateItems(player, items, createParticles, sfx) {
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
                if (typeof createParticles === 'function') createParticles(item.x + item.width/2, item.y + item.height/2, '#FF0000', 15);
                if (typeof sfx !== 'undefined') sfx.hit();
            }
        }
    }
}

function checkGoal(player, goal, createParticles, sfx, leaderboardUpdate, saveGame, currentLevelIndex) {
    if (player.x < goal.x + goal.width &&
        player.x + player.width > goal.x &&
        player.y < goal.y + goal.height &&
        player.y + player.height > goal.y) {
        
        goal.reached = true;
        player.totalWins++;
        player.shakeTime = 20;
        if (typeof createParticles === 'function') createParticles(goal.x + goal.width/2, goal.y + goal.height/2, '#FFFF00', 50);
        if (typeof sfx !== 'undefined') sfx.win();
        
        if (typeof leaderboardUpdate === 'function') leaderboardUpdate(player.levelCoins);
        if (typeof saveGame === 'function') saveGame(player, currentLevelIndex);
        return true;
    }
    return false;
}
