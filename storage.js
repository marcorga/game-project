// storage.js - Gestion de la persistance (LocalStorage)
let leaderboard = [];

function saveGame(player, currentLevelIndex) {
    const saveData = {
        totalWins: player.totalWins,
        currentLevel: currentLevelIndex,
        totalCoins: player.totalCoins,
        leaderboard: leaderboard
    };
    localStorage.setItem('platformer_save', JSON.stringify(saveData));
}

function loadGame(player) {
    const saved = localStorage.getItem('platformer_save');
    if (saved) {
        const data = JSON.parse(saved);
        player.totalWins = data.totalWins || 0;
        player.totalCoins = data.totalCoins || 0;
        leaderboard = data.leaderboard || [];
        return data.currentLevel || 0;
    }
    return 0;
}

function updateLeaderboard(score) {
    leaderboard.push({ score: score, date: new Date().toLocaleDateString() });
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, 5); // Garder le top 5
}
