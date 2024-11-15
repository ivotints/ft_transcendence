// header.js
import { loadCSS } from './utils/loadCSS.js';

export async function header(isLoggedIn) {
    await loadCSS('components/styles/header.css');

    const header = document.createElement('header');
    header.className = 'header';

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
        }
        navButtons.appendChild(button);
    });

    const userSection = document.createElement('div');
    userSection.className = 'user-section';

    if (isLoggedIn) {
        const profileButton = document.createElement('button');
        profileButton.innerText = 'Profile';
        profileButton.className = 'auth-button';
        profileButton.onclick = () => {
            const profileMenu = document.createElement('ul');
            profileMenu.style.position = 'absolute';
            profileMenu.style.top = '40px';
            profileMenu.style.right = '10px';
            profileMenu.style.backgroundColor = '#fff';
            profileMenu.style.border = '1px solid #ccc';
            profileMenu.style.padding = '10px';
            profileMenu.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';

            const functions = ['Func 1', 'Func 2', 'Func 3'];
            functions.forEach(func => {
                const li = document.createElement('li');
                li.innerText = func;
                profileMenu.appendChild(li);
            });

            userSection.appendChild(profileMenu);
        };
        userSection.appendChild(profileButton);
    } else {
        const loginButton = document.createElement('button');
        loginButton.innerText = 'Login';
        loginButton.className = 'auth-button';
        const registerButton = document.createElement('button');
        registerButton.innerText = 'Register';
        registerButton.className = 'auth-button';
        userSection.appendChild(loginButton);
        userSection.appendChild(registerButton);
    }

    header.appendChild(navButtons);
    header.appendChild(userSection);

    return header;
}
