// physics.js - Moteur de physique et collisions
const gravity = 0.5;
const friction = 0.8;

function updatePhysics(player, platforms, wasGrounded) {
    // 1. Déplacer d'abord les plateformes et ajuster la position du joueur s'il est dessus
    for (const plat of platforms) {
        if (plat.moving) {
            // Initialisation des propriétés manquantes pour éviter NaN
            if (plat.vx === undefined) plat.vx = 0;
            if (plat.vy === undefined) plat.vy = 0;
            if (plat.startX === undefined) plat.startX = plat.x;
            if (plat.startY === undefined) plat.startY = plat.y;
            if (plat.rangeX === undefined) plat.rangeX = 0;
            if (plat.rangeY === undefined) plat.rangeY = 0;

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
            
            // Calculer les profondeurs de pénétration
            const overlapX1 = (player.x + player.width) - plat.x;
            const overlapX2 = (plat.x + plat.width) - player.x;
            const overlapY1 = (player.y + player.height) - plat.y;
            const overlapY2 = (plat.y + plat.height) - player.y;

            const minOverlapX = Math.min(overlapX1, overlapX2);
            const minOverlapY = Math.min(overlapY1, overlapY2);

            // Résoudre selon l'axe de plus petite pénétration (standard AABB)
            if (minOverlapY < minOverlapX) {
                // Collision Verticale
                if (overlapY1 < overlapY2) {
                    // Collision par le haut (Atterrissage)
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
                } else {
                    // Collision par le bas (Plafond)
                    player.y = plat.y + plat.height;
                    player.vy = 0;
                }
            } else {
                // Collision Horizontale (Murs)
                if (overlapX1 < overlapX2) {
                    // Gauche de la plateforme
                    player.x = plat.x - player.width;
                    player.vx = 0;
                } else {
                    // Droite de la plateforme
                    player.x = plat.x + plat.width;
                    player.vx = 0;
                }
            }
        }
    }
}
