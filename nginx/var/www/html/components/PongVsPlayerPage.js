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

    // Get current user data
    let currentUserId;
    let currentUsername;
    try {
        const response = await fetch('/api/profiles/me/', {
            credentials: 'include'
        });
        const userData = await response.json();
        currentUserId = userData.user.id;
        currentUsername = userData.user.username;

        // Create player setup form
        const setupForm = document.createElement('form');
        setupForm.className = 'player-setup-form';

        // Player 1 (current user)
        const player1Input = document.createElement('input');
        player1Input.type = 'text';
        player1Input.value = currentUsername;
        player1Input.disabled = true;

        // Player 2
        const player2Input = document.createElement('input');
        player2Input.type = 'text';
        player2Input.placeholder = 'Enter Player 2 name';
        player2Input.required = true;

        // Start button
        const startButton = document.createElement('button');
        startButton.type = 'submit';
        startButton.textContent = 'Start Game';

        setupForm.appendChild(createInputGroup('Player 1:', player1Input));
        setupForm.appendChild(createInputGroup('Player 2:', player2Input));
        setupForm.appendChild(startButton);

        container.appendChild(setupForm);

        setupForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const players = {
                player1: currentUsername,
                player2: player2Input.value,
                player3: 'none',
                player4: 'none'
            };

            // Remove form
            setupForm.remove();

            // Initialize game
            const game = new PongGame(container, players);

            // Add game end handler
            game.onGameEnd = async (winner) => {
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
