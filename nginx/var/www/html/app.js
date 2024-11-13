import { homePage } from './components/homePage.js';
import { profilePage } from './components/profilePage.js';
import { gamePage } from './components/gamePage.js';
import { playerVsPlayerPage } from './components/playerVsPlayerPage.js';
import { playerVsAIPage } from './components/playerVsAIPage.js';
import { tournamentPage } from './components/tournamentPage.js';
import { cowboyPage } from './components/cowboyPage.js';
import { tournamentGamePage } from './components/tournamentGamePage.js';
import { winTablePage } from './components/winTablePage.js';

document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');

    const routes = {
        '/': homePage,
        '/profile': profilePage,
        '/game': gamePage,
        '/game/player-vs-player': playerVsPlayerPage,
        '/game/player-vs-ai': playerVsAIPage,
        '/tournament': tournamentPage,
        '/game/cowboy': cowboyPage,
        '/tournament-game': tournamentGamePage,
        '/win-table': winTablePage,
    };

    function navigateTo(path) {
        window.history.pushState({}, path, window.location.origin + path);
        renderPage(path);
    }

    function renderPage(path) {
        const page = routes[path] || homePage;
        app.innerHTML = '';
        app.appendChild(page());
    }

    window.onpopstate = () => renderPage(window.location.pathname);

    document.body.addEventListener('click', (e) => {
        if (e.target.matches('a')) {
            e.preventDefault();
            navigateTo(e.target.href);
        }
    });

    renderPage(window.location.pathname);
});
