// homePage.js
import { pongGame } from './pongGame.js';

export async function homePage() {

    const container = document.createElement('div');
    container.className = 'home-page-container';

    const isLoggedIn = false;

    const mainContent = document.createElement('div');
    mainContent.className = 'main-content';
    mainContent.innerHTML = '<h2>Pong Game</h2>';

    // Create mode selection
    const modeSelection = document.createElement('div');
    modeSelection.className = 'mode-selection';

    const pvaiButton = document.createElement('button');
    pvaiButton.innerText = 'Player vs AI';
    pvaiButton.className = 'mode-button active';

    const pvpButton = document.createElement('button');
    pvpButton.innerText = 'Player vs Player';
    pvpButton.className = 'mode-button';

    let currentGame = null;
    let currentMode = 'AI';

    pvaiButton.onclick = () => {
        pvaiButton.classList.add('active');
        pvpButton.classList.remove('active');
        currentMode = 'AI';
        if (currentGame) {
            gameContainer.innerHTML = '';
            const canvas = document.createElement('canvas');
            canvas.id = 'pongCanvas';
            gameContainer.appendChild(canvas);
            currentGame = new pongGame(canvas, ['Player', 'AI']);
            instructions.innerText = 'Press W or S to start';
        }
    };

    pvpButton.onclick = () => {
        pvpButton.classList.add('active');
        pvaiButton.classList.remove('active');
        currentMode = 'PVP';
        if (currentGame) {
            gameContainer.innerHTML = '';
            const canvas = document.createElement('canvas');
            canvas.id = 'pongCanvas';
            gameContainer.appendChild(canvas);
            currentGame = new pongGame(canvas, ['Player 1', 'Player 2']);
            instructions.innerText = 'Player 1: W/S, Player 2: ↑/↓';
        }
    };

    modeSelection.appendChild(pvaiButton);
    modeSelection.appendChild(pvpButton);
    mainContent.appendChild(modeSelection);

    // Create game container
    const gameContainer = document.createElement('div');
    gameContainer.id = 'game-container';
    gameContainer.className = 'game-container';

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'pongCanvas';
    gameContainer.appendChild(canvas);

    // Add instructions
    const instructions = document.createElement('p');
    instructions.className = 'instructions';
    instructions.innerText = 'Press W or S to start';
    gameContainer.appendChild(instructions);

    // Initialize game immediately in PvAI mode
    currentGame = new pongGame(canvas, ['Player', 'AI']);

    mainContent.appendChild(gameContainer);
    container.appendChild(mainContent);

    return container;
}
