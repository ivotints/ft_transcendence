// PongTwoVsTwoPage.js
import { PongGame } from './PongGame.js';
import { checkLoginStatus } from './utils/state.js';
import { translate } from './utils/translate.js';

export async function PongTwoVsTwoPage() {
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
        player2Input.placeholder = translate('Enter Player 2 name');
        player2Input.maxLength = 32;
        player2Input.required = true;

        const player3Input = document.createElement('input');
        player3Input.type = 'text';
        player3Input.placeholder = translate('Enter Player 3 name');
        player3Input.maxLength = 32;
        player3Input.required = true;

        const player4Input = document.createElement('input');
        player4Input.type = 'text';
        player4Input.placeholder = translate('Enter Player 4 name');
        player4Input.maxLength = 32;
        player4Input.required = true;

        const startButton = document.createElement('button');
        startButton.type = 'submit';
        startButton.textContent = translate('Start Game');

        const errorMessage = document.createElement('p');
        errorMessage.className = 'error-message';
        errorMessage.style.display = 'none';

        setupForm.appendChild(createInputGroup(translate('Player 1:'), player1Input));
        setupForm.appendChild(createInputGroup(translate('Player 2:'), player2Input));
        setupForm.appendChild(createInputGroup(translate('Player 3:'), player3Input));
        setupForm.appendChild(createInputGroup(translate('Player 4:'), player4Input));
        setupForm.appendChild(startButton);
        setupForm.appendChild(errorMessage);

        container.appendChild(setupForm);

        setupForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const validNameRegex = /^[a-zA-Z0-9@.+\-_]+$/;
            const playerInputs = [player2Input, player3Input, player4Input];
            const playerValues = playerInputs.map(input => input.value.trim());

            if (playerValues.includes('none')) {
                errorMessage.textContent = translate('Username "none" is not allowed');
                errorMessage.style.display = 'block';
                return;
            }

            if (playerValues.includes(currentUsername)) {
                errorMessage.textContent = translate('Player names must be different');
                errorMessage.style.display = 'block';
                return;
            }

            const uniqueNames = new Set(playerValues);
            if (uniqueNames.size !== playerValues.length) {
                errorMessage.textContent = translate('All player names must be different');
                errorMessage.style.display = 'block';
                return;
            }

            for (const input of playerInputs) {
                const value = input.value.trim();
                if (!validNameRegex.test(value)) {
                    errorMessage.textContent = translate('This value may contain only letters, numbers, and @/./+/-/_ characters.');
                    errorMessage.style.display = 'block';
                    return;
                }
            }

            errorMessage.style.display = 'none';
            const players = {
                player1: currentUsername,
                player2: player2Input.value.trim(),
                player3: player3Input.value.trim(),
                player4: player4Input.value.trim()
            };

            setupForm.remove();

            const game = new PongGame(container, players);

            game.onGameEnd = async () => {
                try {
                    await fetch('/api/matches/2v2/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include',
                        body: JSON.stringify({
                            player1: currentUserId,
                            player2: players.player2,
                            player3: players.player3,
                            player4: players.player4,
                            match_score: `${game.player1.score + game.player3.score}-${game.player2.score + game.player4.score}`
                        })
                    });
                } catch (error) {
                    console.error(translate('Error saving match result:'), error);
                }
            };
        });

    } catch (error) {
        console.error(translate('Error fetching user data:'), error);
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
