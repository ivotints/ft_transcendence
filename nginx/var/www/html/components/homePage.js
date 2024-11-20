// homePage.js
import { checkLoginStatus } from './utils/state.js';
import { authForms } from './utils/auth.js';

export async function homePage() {
    const container = document.createElement('div');
    container.className = 'home-page';

    const welcomeMessage = document.createElement('h1');
    welcomeMessage.innerText = 'Welcome to Pong Transcendence';
    container.appendChild(welcomeMessage);

    if (checkLoginStatus()) {
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'logged-in-buttons';

        const gameOptions = [
            { text: 'Player vs Player', path: '/vs-player' },
            { text: 'Player vs AI', path: '/vs-ai' },
            { text: '2 Players vs 2 Players', path: '/2v2' },
            { text: 'Tournament', path: '/tournament' }
        ];

        gameOptions.forEach(option => {
            const button = document.createElement('button');
            button.innerText = option.text;
            button.className = 'logged-in-button';
            button.addEventListener('click', () => {
                window.navigateTo(option.path);
            });
            buttonContainer.appendChild(button);
        });

        container.appendChild(buttonContainer);
    } else {
        const authContainer = authForms();
        container.appendChild(authContainer);
    }
    return container;
}
