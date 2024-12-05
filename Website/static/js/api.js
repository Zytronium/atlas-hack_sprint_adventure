const API_BASE_URL = 'https://zytronium.github.io/atlas-hack_sprint_adventure/';

async function saveGameState(gameData) {
    try {
        const response = await fetch(`${API_BASE_URL}/game-state`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(gameData)
        });
        return await response.json();
    } catch (error) {
        console.error('Error saving game state:', error);
    }
}

async function getGameState(gameId) {
    try {
        const response = await fetch(`${API_BASE_URL}/game-state?game_id=${gameId}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching game state:', error);
    }
}

async function savePlayerProgress(progressData) {
    try {
        const response = await fetch(`${API_BASE_URL}/player-progress`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(progressData)
        });
        return await response.json();
    } catch (error) {
        console.error('Error saving player progress:', error);
    }
}

async function getPlayerProgress(playerId) {
    try {
        const response = await fetch(`${API_BASE_URL}/player-progress?player_id=${playerId}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching player progress:', error);
    }
}

export { saveGameState, getGameState, savePlayerProgress, getPlayerProgress };