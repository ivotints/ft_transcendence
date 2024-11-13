export function profilePage() {
    const container = document.createElement('div');
    container.className = 'App';
    const header = document.createElement('h1');
    header.textContent = 'Profile Page';
    container.appendChild(header);
    // Add profile content here
    return container;
}
