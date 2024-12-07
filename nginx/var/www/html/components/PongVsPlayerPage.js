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

    let currentUserId;
    let currentUsername;
    try {
        const response = await fetch('/api/profiles/me/', {
            credentials: 'include'
        });
        const userData = await response.json();
        currentUserId = userData.user.id;
        currentUsername = userData.user.username;

        const setupForm = document.createElement('form');
        setupForm.className = 'player-setup-form';

        const player1Input = document.createElement('input');
        player1Input.type = 'text';
        player1Input.value = currentUsername;
        player1Input.disabled = true;

        const player2Input = document.createElement('input');
        player2Input.type = 'text';
        player2Input.placeholder = 'Enter Player 2 name';
        player2Input.maxLength = 32;
        player2Input.required = true;

        const startButton = document.createElement('button');
        startButton.type = 'submit';
        startButton.textContent = 'Start Game';

        const errorMessage = document.createElement('p');
        errorMessage.className = 'error-message';
        errorMessage.style.display = 'none';

        setupForm.appendChild(createInputGroup('Player 1:', player1Input));
        setupForm.appendChild(createInputGroup('Player 2:', player2Input));
        setupForm.appendChild(startButton);
        setupForm.appendChild(errorMessage);

        container.appendChild(setupForm);

        setupForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const player2Value = player2Input.value.trim();
            const validNameRegex = /^[a-zA-Z0-9@.+\-_]+$/;

            // Check for duplicate names first
            if (player2Value === currentUsername) {
                errorMessage.textContent = 'Player names must be different';
                errorMessage.style.display = 'block';
                return;
            }

            // Then check for valid characters
            if (!validNameRegex.test(player2Value)) {
                errorMessage.textContent = 'This value may contain only letters, numbers, and @/./+/-/_ characters.';
                errorMessage.style.display = 'block';
                return;
            }

            errorMessage.style.display = 'none';
            const players = {
                player1: currentUsername,
                player2: player2Value,
                player3: 'none',
                player4: 'none'
            };

            setupForm.remove();

            const game = new PongGame(container, players);

            game.onGameEnd = async () => {
                try {
                    await fetch('/api/matches/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include',
                        body: JSON.stringify({
                            player1: currentUserId,
                            player2: players.player2,
                            match_score: `${game.player1.score}-${game.player2.score}`
                        })
                    });
                } catch (error) {
                    console.error('Error saving match result:', error);
                }
            };
        });

    } catch (error) {
        console.error('Error fetching user data:', error);
    }

    return container;
}

function createInputGroup(label, input) {
    const group = document.createElement('div');
    group.className = 'input-group';

    const labelElement = document.createElement('label');
    labelElement.textContent = label;

    group.appendChild(labelElement);
    group.appendChild(input);

    return group;
}
