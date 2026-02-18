// physics.js - Moteur de physique et collisions
const gravity = 0.5;
const friction = 0.8;

function updatePhysics(player, platforms, wasGrounded) {
    // 1. Déplacer d'abord les plateformes et ajuster la position du joueur s'il est dessus
    for (const plat of platforms) {
        if (plat.moving) {
            const oldPlatX = plat.x;
            const oldPlatY = plat.y;

            // Mise à jour de la position de la plateforme
            plat.x += plat.vx;
            plat.y += plat.vy;

            // Inversion de direction si hors limites
            if (Math.abs(plat.x - plat.startX) > plat.rangeX) plat.vx *= -1;
            if (Math.abs(plat.y - plat.startY) > plat.rangeY) plat.vy *= -1;

            // Si le joueur était sur cette plateforme au tour précédent, on le déplace avec elle
            if (player.onPlatform === plat) {
                player.x += (plat.x - oldPlatX);
                player.y += (plat.y - oldPlatY);
            }
        }
    }

    // 2. Appliquer la physique propre au joueur
    player.vy += gravity;
    player.x += player.vx;
    player.y += player.vy;

    player.grounded = false;
    player.onPlatform = null;
    
    // 3. Résolution des collisions
    for (const plat of platforms) {
        if (player.x < plat.x + plat.width && player.x + player.width > plat.x &&
            player.y < plat.y + plat.height && player.y + player.height > plat.y) {
            
            // Collision par le haut (le joueur atterrit sur la plateforme)
            if (player.vy > 0 && (player.y + player.height - player.vy) <= plat.y + Math.abs(plat.vy)) {
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
            } 
            // Collision par le bas (le joueur se cogne la tête)
            else if (player.vy < 0 && (player.y - player.vy) >= (plat.y + plat.height - Math.abs(plat.vy))) {
                player.y = plat.y + plat.height;
                player.vy = 0;
            }
        }
    }
}
