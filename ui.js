// ui.js - Gestion des entrées utilisateur et des transitions d'interface
const keys = {};

function initInputs() {
    window.addEventListener('keydown', e => keys[e.code] = true);
    window.addEventListener('keyup', e => keys[e.code] = false);
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
