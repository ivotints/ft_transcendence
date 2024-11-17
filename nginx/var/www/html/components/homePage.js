// homePage.js
import { checkLoginStatus, setLoggedIn } from './utils/state.js';

export async function homePage() {
    const container = document.createElement('div');
    container.className = 'home-page';

    if (checkLoginStatus()) {
        // User is logged in
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'logged-in-buttons';

        const loggedInButtons = ['1', '2', '3'];
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
            document.body.innerHTML = ''; // Clear the body
            document.body.appendChild(await homePage()); // Re-render homePage
        });

        container.appendChild(form);
    }

    return container;
}

function showAuthForm(type) {
    const form = document.querySelector('.auth-form');
    form.style.display = 'block';
    // Customize form based on type if needed
}
