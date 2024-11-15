import { homePage } from './components/homePage.js';
import { notFoundPage } from './components/notFoundPage.js';
import { pongGame } from './components/pongGame.js';

document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    const loadingIndicator = document.createElement('div');
    loadingIndicator.id = 'loading-indicator';
    loadingIndicator.innerText = 'Loading...';
    document.body.appendChild(loadingIndicator);

    const routes = {
        '/': homePage,
        // Add other routes here
    };

    const cache = {};

    async function navigateTo(path) {
        if (window.location.pathname !== path) {
            window.history.pushState({}, path, window.location.origin + path);
        }
        await renderPage(path);
    }

    async function renderPage(path) {
        const page = routes[path] || notFoundPage;
        app.innerHTML = '';
        showLoadingIndicator();
        if (cache[path]) {
            app.appendChild(cache[path]);
            hideLoadingIndicator();
        } else {
            const pageContent = await page();
            cache[path] = pageContent;
            app.appendChild(pageContent);
            hideLoadingIndicator();
        }
    }

    function showLoadingIndicator() {
        loadingIndicator.style.display = 'block';
    }

    function hideLoadingIndicator() {
        loadingIndicator.style.display = 'none';
    }

    window.onpopstate = () => renderPage(window.location.pathname);

    document.body.addEventListener('click', (e) => {
        if (e.target.matches('a')) {
            e.preventDefault();
            navigateTo(e.target.href);
        }
    });

    window.navigateTo = navigateTo;
    renderPage(window.location.pathname);
});
