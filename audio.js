// audio.js - Moteur audio procédural et SFX
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, type, duration, volume = 0.1) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(volume, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

const sfx = {
    jump: () => playTone(400, 'square', 0.1),
    coin: () => {
        playTone(800, 'sine', 0.1);
        setTimeout(() => playTone(1200, 'sine', 0.1), 50);
    },
    death: () => {
        playTone(200, 'sawtooth', 0.3);
        playTone(150, 'sawtooth', 0.3);
    },
    hit: () => playTone(300, 'triangle', 0.2),
    win: () => {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((f, i) => setTimeout(() => playTone(f, 'triangle', 0.2, 0.15), i * 100));
    }
};

let musicBpm = 120;
let musicStep = 0;
let musicInterval = null;
const scales = {
    major: [261.63, 293.66, 329.63, 392.00, 440.00],
    minor: [261.63, 311.13, 349.23, 392.00, 466.16]
};

function playMusicStep() {
    if (typeof gameState !== 'undefined' && gameState !== 'PLAYING') return;
    const currentScale = (typeof currentLevelIndex !== 'undefined' && currentLevelIndex % 2 === 0) ? scales.major : scales.minor;
    if (musicStep % 4 === 0) playTone(currentScale[0] / 2, 'triangle', 0.4, 0.05);
    if (Math.random() > 0.7) {
        const note = currentScale[Math.floor(Math.random() * currentScale.length)];
        playTone(note, 'sine', 0.2, 0.03);
    }
    musicStep = (musicStep + 1) % 16;
}

function startMusic() {
    if (musicInterval) clearInterval(musicInterval);
    musicInterval = setInterval(playMusicStep, (60 / musicBpm) * 250);
}
