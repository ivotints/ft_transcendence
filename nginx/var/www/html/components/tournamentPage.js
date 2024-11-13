export function tournamentPage() {
    const container = document.createElement('div');
    container.className = 'App';
    const header = document.createElement('h1');
    header.textContent = 'Tournament';
    container.appendChild(header);
    // Add tournament content here
    return container;
}
