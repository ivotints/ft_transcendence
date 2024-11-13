export function tournamentGamePage() {
    const container = document.createElement('div');
    container.className = 'App';
    const header = document.createElement('h1');
    header.textContent = 'Tournament Game';
    container.appendChild(header);
    // Add tournament game content here
    return container;
}
