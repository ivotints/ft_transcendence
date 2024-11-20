import { homePage } from './components/homePage.js';
import { notFoundPage } from './components/notFoundPage.js';
import { tournamentPage } from './components/tournamentPage.js';
import { header } from './components/header.js';
import { profilePage } from './components/profilePage.js';
import { gamePage } from './components/gamePage.js';
import { PongVsPlayerPage } from './components/PongVsPlayerPage.js';
import { PongVsAIPage } from './components/PongVsAIPage.js';
import { PongTwoVsTwoPage } from './components/PongTwoVsTwoPage.js';
import { cowboyPage } from './components/cowboyPage.js';
import { checkLoginStatus } from './components/utils/state.js';
import { refreshToken, setupTokenRefresh } from './components/utils/auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is logged in and setup token refresh
    if (checkLoginStatus()) {
        const isValid = await refreshToken();
        if (isValid) {
            setupTokenRefresh();
        }
    }

    const app = document.getElementById('app');
    const loadingIndicator = document.createElement('div');
    loadingIndicator.id = 'loading-indicator';
    loadingIndicator.innerText = 'Loading...';
    document.body.appendChild(loadingIndicator);

    const routes = {
        '/': homePage,
        '/tournament': tournamentPage,
        '/profile': profilePage,
        '/game': gamePage,
        '/vs-player': PongVsPlayerPage,
        '/vs-ai': PongVsAIPage,
        '/2v2': PongTwoVsTwoPage,
        '/cowboy': cowboyPage,
        // Add other routes here
    };

    let cache = {};

    async function navigateTo(path) {
        if (window.location.pathname !== path) {
            window.history.pushState({}, path, window.location.origin + path);
        }
        await renderPage(path);
    }

    async function renderPage(path) {
        const page = routes[path] || notFoundPage;

        // List of routes that shouldn't be cached (game pages)
        const noCacheRoutes = ['/vs-player', '/vs-ai', '/2v2'];

        // Run cleanup on existing game if present
        const existingGame = app.querySelector('.match-container');
        if (existingGame) {
            const cleanupEvent = new Event('cleanup');
            existingGame.dispatchEvent(cleanupEvent);
        }

        app.innerHTML = '';
        showLoadingIndicator();

        // Skip cache for game routes
        if (cache[path] && !noCacheRoutes.includes(path)) {
            app.appendChild(cache[path]);
            hideLoadingIndicator();
        } else {
            const container = document.createElement('div');
            container.className = 'page-container';

            const headerElement = await header();
            container.appendChild(headerElement);

            const pageContent = await page();
            container.appendChild(pageContent);

            // Only cache non-game pages
            if (!noCacheRoutes.includes(path)) {
                cache[path] = container;
            }

            app.appendChild(container);
            hideLoadingIndicator();
        }
    }

    function showLoadingIndicator() {
        loadingIndicator.style.display = 'block';
    }

    function hideLoadingIndicator() {
        loadingIndicator.style.display = 'none';
    }

    // Add cache clearing function
    function clearPageCache() {
        cache = {};
    }

    window.onpopstate = () => renderPage(window.location.pathname);

    document.body.addEventListener('click', (e) => {
        if (e.target.matches('a')) {
            e.preventDefault();
            navigateTo(e.target.href);
        }
    });

    window.navigateTo = navigateTo; // Attach navigateTo to the window object
    window.renderPage = renderPage; // Expose renderPage
    window.clearPageCache = clearPageCache; // Expose clearPageCache
    renderPage(window.location.pathname);
});

