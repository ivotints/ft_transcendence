export function playerVsPlayerPage() {
    const container = document.createElement('div');
    container.className = 'App';
    const header = document.createElement('h1');
    header.textContent = 'Player vs Player';
    container.appendChild(header);
    // Add player vs player game content here
    return container;
}
