export function winTablePage() {
    const container = document.createElement('div');
    container.className = 'App';
    const header = document.createElement('h1');
    header.textContent = 'Win Table';
    container.appendChild(header);
    // Add win table content here
    return container;
}
