// header.js
import { state, setLoggedIn } from './utils/state.js';
import { loadAllStyles } from './utils/loadCSS.js';
import { logout } from './utils/auth.js';
import { translate } from './utils/translate.js';

async function handleNavigation(path) {
    try {
        // Make a request to verify auth status
        const response = await fetch('/api/token/refresh/', {
            method: 'POST',
            credentials: 'include'
        });

        if (response.status === 400) {
            // If unauthorized, log the user out
            await logout();
            return;
        }

        // If authorized, proceed with navigation
        navigateTo(path);

    } catch (error) {
        console.error('Navigation error:', error);
        await logout();
    }
}

export async function header() {
    await loadAllStyles();

    const headerElement = document.createElement('header');
    headerElement.className = 'header';

    const navButtons = document.createElement('div');
    navButtons.className = 'nav-buttons';
    ['Home', 'Profile', 'Games', 'Tournament', 'Log out'].forEach(num => {
        const button = document.createElement('button');
        button.innerText = translate(num);
        button.className = 'nav-button';
        if (num === 'Home') {
            button.addEventListener('click', () => {
                handleNavigation('/');
            });
        } else if (num === 'Tournament') {
            button.addEventListener('click', () => {
                handleNavigation('/tournament');
            });
        } else if (num === 'Profile') {
            button.addEventListener('click', () => {
                handleNavigation('/profile');
            });
        } else if (num === 'Games') {
            button.addEventListener('click', () => {
                handleNavigation('/game');
            });
        } else if (num === 'Log out') {
            button.addEventListener('click', () => {
                logout();
            });
        }
        navButtons.appendChild(button);
    });

    headerElement.appendChild(navButtons);

    if (!state.isLoggedIn) {
        headerElement.classList.add('hidden');
    }

    return headerElement;
}
