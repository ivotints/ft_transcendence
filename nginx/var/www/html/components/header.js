// header.js
import { state, setLoggedIn } from './utils/state.js';
import { loadAllStyles } from './utils/loadCSS.js';
import { logout } from './utils/auth.js';

export async function header() {
    await loadAllStyles();

    const headerElement = document.createElement('header');
    headerElement.className = 'header';

    const navButtons = document.createElement('div');
    navButtons.className = 'nav-buttons';
    ['Home', 'Profile', 'Games', 'Tournament', 'Log out'].forEach(num => {
        const button = document.createElement('button');
        button.innerText = num;
        button.className = 'nav-button';
        if (num === 'Home') {
            button.addEventListener('click', () => {
                navigateTo('/');
            });
        } else if (num === 'Tournament') {
            button.addEventListener('click', () => {
                navigateTo('/tournament');
            });
        } else if (num === 'Profile') {
            button.addEventListener('click', () => {
                navigateTo('/profile');
            });
        } else if (num === 'Games') {
            button.addEventListener('click', () => {
                navigateTo('/game');
            });
        } else if (num === 'Log out') {
            button.addEventListener('click', () => {
                logout();
            });
        }
        navButtons.appendChild(button);
    });

    headerElement.appendChild(navButtons);

    // Add class to hide header if not logged in
    if (!state.isLoggedIn) {
        headerElement.classList.add('hidden');
    }

    return headerElement;
}
