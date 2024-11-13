export function gamePage() {
    const container = document.createElement('div');
    container.className = 'App';
    const header = document.createElement('h1');
    header.textContent = 'Choose Your Game Option';
    container.appendChild(header);
    const gameOptions = document.createElement('div');
    gameOptions.className = 'game-options';
    // Add game options here
    container.appendChild(gameOptions);
    return container;
}
