// gamePage.js
import { checkLoginStatus } from './utils/state.js';
import { translate } from './utils/translate.js';

export async function gamePage() {
    // Check login status and redirect if not logged in
    if (!checkLoginStatus()) {
        window.navigateTo('/');
        return document.createElement('div'); // Return empty div while redirecting
    }

    const container = document.createElement('div');
    container.className = 'game-container';

    // Add title
    const title = document.createElement('h1');
    title.className = 'profileH2';
    title.textContent = translate('Select Match Type');
    container.appendChild(title);

    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'button-group';

    const gameOptions = [
        { text: 'Player vs Player', path: '/vs-player' },
        { text: 'Player vs AI', path: '/vs-ai' },
        { text: '2 Players vs 2 Players', path: '/2v2' },
        { text: 'Cowboy game', path: '/cowboy' }
    ];

    gameOptions.forEach(option => {
        const button = document.createElement('button');
        button.className = 'submit-button';
        button.textContent = translate(option.text);
        button.addEventListener('click', () => {
            window.navigateTo(option.path);
        });
        buttonGroup.appendChild(button);
    });

    container.appendChild(buttonGroup);
    return container;
}
