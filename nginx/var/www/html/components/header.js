// header.js
import { state, setLoggedIn } from './utils/state.js';
import { loadAllStyles } from './utils/loadCSS.js';
import { homePage } from './homePage.js';

export async function header() {
    await loadAllStyles();

    const headerElement = document.createElement('header');
    headerElement.className = 'header';

    const navButtons = document.createElement('div');
    navButtons.className = 'nav-buttons';
    ['Home', 'Profile', 'Games', 'Tournament'].forEach(num => {
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
        }
        navButtons.appendChild(button);
    });

    const userSection = document.createElement('div');
    userSection.className = 'user-section';

    if (state.isLoggedIn) {
        const logoutButton = document.createElement('button');
        logoutButton.innerText = 'Log out';
        logoutButton.className = 'auth-button';
        logoutButton.onclick = async () => {
            navigateTo('/'); // Redirect to home page
            setLoggedIn(false);
            const headerElement = document.querySelector('.header');
            if (headerElement) {
                headerElement.replaceWith(await header());
                document.querySelector('.home-page').replaceWith(await homePage()); // Re-render homePage
            }
        };
        userSection.appendChild(logoutButton);
    } else {
        const loginButton = document.createElement('button');
        loginButton.innerText = 'Login';
        loginButton.className = 'auth-button';
        loginButton.onclick = async () => {
            setLoggedIn(true);
            document.querySelector('.header').replaceWith(await header());
            document.querySelector('.home-page').replaceWith(await homePage()); // Re-render homePage
        };

        const registerButton = document.createElement('button');
        registerButton.innerText = 'Register';
        registerButton.className = 'auth-button';
        userSection.appendChild(loginButton);
        userSection.appendChild(registerButton);
    }

    headerElement.appendChild(navButtons);
    headerElement.appendChild(userSection);

    // Add class to hide header if not logged in
    if (!state.isLoggedIn) {
        headerElement.classList.add('hidden');
    }

    return headerElement;
}
