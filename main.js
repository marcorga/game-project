const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

function update() {
    // Logique de mise à jour future
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Test simple: dessiner un rectangle
    ctx.fillStyle = '#00FF00';
    ctx.fillRect(50, 50, 50, 50);
    
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Platformer Initialisé', 10, 30);
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();
console.log("Moteur de jeu initialisé.");