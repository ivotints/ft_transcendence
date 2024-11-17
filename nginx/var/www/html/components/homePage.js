// homePage.js
import { checkLoginStatus, setLoggedIn } from './utils/state.js';
import { header } from './header.js';

export async function homePage() {
    const container = document.createElement('div');
    container.className = 'home-page';

    // Add welcome message
    const welcomeMessage = document.createElement('h1');
    welcomeMessage.innerText = 'Welcome to Pong Transcendence';
    container.appendChild(welcomeMessage);

    if (checkLoginStatus()) {
        // User is logged in
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'logged-in-buttons';

        const loggedInButtons = ['Player vs AI', 'Player vs Player', '2 vs 2', 'Cowboy Game'];
        loggedInButtons.forEach(text => {
            const button = document.createElement('button');
            button.innerText = text;
            button.className = 'logged-in-button';
            buttonContainer.appendChild(button);
        });

        container.appendChild(buttonContainer);
    } else {
        // User is not logged in
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'auth-buttons';

        const authButtons = ['Login', 'Register', '42'];
        authButtons.forEach(text => {
            const button = document.createElement('button');
            button.innerText = text;
            button.className = 'auth-button';
            button.addEventListener('click', () => {
                showAuthForm(text);
            });
            buttonContainer.appendChild(button);
        });

        container.appendChild(buttonContainer);

        const form = document.createElement('form');
        form.className = 'auth-form';
        form.style.display = 'none';

        const usernameInput = document.createElement('input');
        usernameInput.type = 'text';
        usernameInput.placeholder = 'Username';
        form.appendChild(usernameInput);

        const emailInput = document.createElement('input');
        emailInput.type = 'email';
        emailInput.placeholder = 'Email';
        emailInput.style.display = 'none'; // Initially hidden
        form.appendChild(emailInput);

        const passwordInput = document.createElement('input');
        passwordInput.type = 'password';
        passwordInput.placeholder = 'Password';
        form.appendChild(passwordInput);

        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.innerText = 'Submit';
        form.appendChild(submitButton);

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            // Simulate login
            setLoggedIn(true);
            document.querySelector('.header').replaceWith(await header()); // Re-render header
            document.querySelector('.home-page').replaceWith(await homePage()); // Re-render homePage
        });

        container.appendChild(form);
    }

    return container;
}

function showAuthForm(type) {
    const form = document.querySelector('.auth-form');
    const emailInput = form.querySelector('input[type="email"]');
    form.style.display = 'flex';
    form.style.flexDirection = 'column';
    form.style.gap = '10px';

    if (type === 'Register') {
        emailInput.style.display = 'block';
    } else {
        emailInput.style.display = 'none';
    }
}
