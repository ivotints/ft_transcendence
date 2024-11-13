export function cowboyPage() {
    const container = document.createElement('div');
    container.className = 'App';
    const header = document.createElement('h1');
    header.textContent = 'Cowboy Game';
    container.appendChild(header);
    // Add cowboy game content here
    return container;
}
