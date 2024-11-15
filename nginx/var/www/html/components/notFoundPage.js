export function notFoundPage() {
    const container = document.createElement('div');
    container.className = 'not-found-page';

    const message = document.createElement('h1');
    message.innerText = '404 - Page Not Found';

    container.appendChild(message);

    return container;
}
