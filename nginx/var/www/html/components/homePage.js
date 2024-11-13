export function homePage() {
    const container = document.createElement('div');
    container.className = 'App';

    const header = document.createElement('h1');
    header.textContent = 'Welcome to Pong Transcendence';
    container.appendChild(header);

    const authOptions = document.createElement('div');
    authOptions.className = 'auth-options';

    const loginButton = document.createElement('button');
    loginButton.className = 'auth-button';
    loginButton.textContent = 'Log In';
    loginButton.onclick = () => alert('Log In button clicked');

    const createUserButton = document.createElement('button');
    createUserButton.className = 'auth-button';
    createUserButton.textContent = 'Create User';
    createUserButton.onclick = () => alert('Create User button clicked');

    const oauthButton = document.createElement('button');
    oauthButton.className = 'auth-button';
    oauthButton.textContent = '42';
    oauthButton.onclick = () => alert('42 button clicked');

    authOptions.appendChild(loginButton);
    authOptions.appendChild(createUserButton);
    authOptions.appendChild(oauthButton);

    container.appendChild(authOptions);
    return container;
}
