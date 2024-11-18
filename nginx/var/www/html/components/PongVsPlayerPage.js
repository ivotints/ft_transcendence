// PongVsPlayerPage.js
import { PongGame } from './PongGame.js';
import { checkLoginStatus } from './utils/state.js';

export async function PongVsPlayerPage() {
    if (!checkLoginStatus()) {
        window.navigateTo('/');
        return document.createElement('div');
    }

    const container = document.createElement('div');
    container.className = 'match-container';

    const players = {
        player1: 'Player 1',
        player2: 'Player 2',
        player3: 'none',
        player4: 'none'
    };

    const game = new PongGame(container, players);
    return container;
}
