// physics.js - Moteur de physique et collisions
const gravity = 0.5;
const friction = 0.8;

function updatePhysics(player, platforms, wasGrounded) {
    player.vy += gravity;
    player.x += player.vx;
    player.y += player.vy;

    player.grounded = false;
    player.onPlatform = null;
    
    for (const plat of platforms) {
        // Logic for moving platforms
        if (plat.moving) {
            plat.x += plat.vx;
            plat.y += plat.vy;
            if (Math.abs(plat.x - plat.startX) > plat.rangeX) plat.vx *= -1;
            if (Math.abs(plat.y - plat.startY) > plat.rangeY) plat.vy *= -1;
            
            if (player.grounded && player.onPlatform === plat) {
                player.x += plat.vx;
                player.y += plat.vy;
            }
        }

        // Collision detection
        if (player.x < plat.x + plat.width && player.x + player.width > plat.x &&
            player.y < plat.y + plat.height && player.y + player.height > plat.y) {
            
            if (player.vy > 0 && (player.y + player.height - player.vy) <= plat.y) {
                player.y = plat.y - player.height;
                player.vy = 0;
                player.grounded = true;
                player.onPlatform = plat;
                
                if (!wasGrounded) {
                    if (typeof createParticles === 'function') {
                        createParticles(player.x + player.width/2, player.y + player.height, '#FFF', 5);
                    }
                    if (player.vy > 5) player.shakeTime = 3;
                }
            } else if (player.vy < 0 && (player.y - player.vy) >= (plat.y + plat.height)) {
                player.y = plat.y + plat.height;
                player.vy = 0;
            }
        }
    }
}
