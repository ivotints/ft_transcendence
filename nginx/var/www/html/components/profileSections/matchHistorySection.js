// profileSections/matchHistorySection.js

export function renderMatchHistory(mainContent) {
    const historyDiv = document.createElement('div');
    historyDiv.className = 'match-history';
    historyDiv.innerHTML = `<h2 class="profileH2">Match History</h2>`;

    const selectDiv = document.createElement('div');
    selectDiv.innerHTML = `
        <label for="match-type">Select Match Type: </label>
        <select id="match-type" class="dropdown">
            <option value="1v1">1 vs 1</option>
            <option value="2v2">2 vs 2</option>
            <option value="tournament">Tournament</option>
            <option value="cowboy">Cowboy Game</option>
        </select>
    `;

    const matchList = document.createElement('ul');
    matchList.className = 'match-list';

    const select = selectDiv.querySelector('select');
    select.addEventListener('change', (e) => {
        fetchMatchHistory(e.target.value, matchList);
    });

    historyDiv.appendChild(selectDiv);
    historyDiv.appendChild(matchList);
    mainContent.appendChild(historyDiv);

    // Initial load with 1v1 matches
    fetchMatchHistory('1v1', matchList);
}

async function fetchMatchHistory(type, listElement) {
    listElement.innerHTML = '<p>Loading...</p>';

    try {
        let endpoint = '/api/matches/';
        switch (type) {
            case '2v2':
                endpoint = '/api/matches/2v2/';
                break;
            case 'tournament':
                endpoint = '/api/tournaments/';
                break;
            case 'cowboy':
                endpoint = '/api/matches/cowboy/';
                break;
        }

        const response = await fetch(endpoint, { credentials: 'include' });
        const matches = await response.json();

        listElement.innerHTML = '';

        matches.forEach(match => {
            const li = document.createElement('li');

            if (type === 'tournament') {
                li.className = 'tournament';
                li.innerHTML = `
                    <p><strong>Tournament Id:</strong> ${match.tournament_id}</p>
                    <p><strong>Match Date:</strong> ${new Date(match.match_date).toLocaleDateString()}</p>
                    <p><strong>Winners Order:</strong></p>
                    <ul>
                        ${Array.isArray(match.winners_order_display)
                        ? match.winners_order_display.map((username, index) =>
                            `<li><strong>${index + 1}${index === 0 ? 'st' : index === 1 ? 'nd' : index === 2 ? 'rd' : 'th'} Place:</strong> ${username}</li>`
                        ).join('')
                        : '<li>N/A</li>'
                    }
                    </ul>
                `;
            } else {
                li.innerHTML = `
                    <p><strong>Player 1:</strong> ${match.player1_username}</p>
                    <p><strong>Player 2:</strong> ${match.player2}</p>
                    ${type === '2v2' ? `
                        <p><strong>Player 3:</strong> ${match.player3}</p>
                        <p><strong>Player 4:</strong> ${match.player4}</p>
                        <p><strong>Winner 1:</strong> ${match.winner1}</p>
                        <p><strong>Winner 2:</strong> ${match.winner2}</p>
                    ` : `
                        <p><strong>Winner:</strong> ${match.winner}</p>
                    `}
                    <p><strong>Match Date:</strong> ${new Date(match.match_date).toLocaleDateString()}</p>
                    <p><strong>Match score:</strong> ${match.match_score}</p>
                `;
            }

            listElement.appendChild(li);
        });
    } catch (error) {
        console.error('Error fetching match history:', error);
        listElement.innerHTML = '<p>Error loading match history</p>';
    }
}
