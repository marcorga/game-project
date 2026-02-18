// player.js - Gestionnaire de l'entité Joueur
const player = {
    x: 50,
    y: 50,
    width: 30,
    height: 30,
    color: '#FFD700',
    eyeColor: '#000',
    vx: 0,
    vy: 0,
    speed: 5,
    jumpStrength: -10,
    grounded: false,
    jumpPressed: false,
    alive: true,
    hp: 3,
    maxHp: 3,
    invincible: 0,
    totalWins: 0,
    totalCoins: 0,
    levelCoins: 0,
    shakeTime: 0,
    onPlatform: null,

    reset(x, y, hp) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.alive = true;
        this.hp = hp || this.maxHp;
        this.invincible = 0;
        this.levelCoins = 0;
        this.grounded = false;
        this.onPlatform = null;
    },

    takeDamage(shakeAmount = 10) {
        if (this.invincible > 0) return false;
        this.hp--;
        this.shakeTime = shakeAmount;
        this.invincible = 60;
        if (typeof createParticles === 'function') {
            createParticles(this.x + this.width/2, this.y + this.height/2, '#FF0000', 10);
        }
        if (typeof sfx !== 'undefined') sfx.hit();
        if (this.hp <= 0) this.kill();
        return true;
    },

    kill() {
        this.alive = false;
        this.shakeTime = 15;
        if (typeof createParticles === 'function') {
            createParticles(this.x + this.width/2, this.y + this.height/2, this.color, 25);
        }
        if (typeof sfx !== 'undefined') sfx.death();
    }
};
