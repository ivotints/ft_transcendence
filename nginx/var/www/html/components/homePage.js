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
    loginButton.onclick = () => showLoginForm();

    const createUserButton = document.createElement('button');
    createUserButton.className = 'auth-button';
    createUserButton.textContent = 'Create User';
    createUserButton.onclick = () => showCreateUserForm();

    const oauthButton = document.createElement('button');
    oauthButton.className = 'auth-button';
    oauthButton.textContent = '42';
    oauthButton.onclick = () => alert('42 button clicked');

    authOptions.appendChild(loginButton);
    authOptions.appendChild(createUserButton);
    authOptions.appendChild(oauthButton);

    container.appendChild(authOptions);

    const formContainer = document.createElement('div');
    formContainer.className = 'form-container';
    container.appendChild(formContainer);

    return container;

    function showLoginForm() {
        formContainer.innerHTML = '';

        const usernameInput = document.createElement('input');
        usernameInput.type = 'text';
        usernameInput.placeholder = 'Username';
        usernameInput.maxLength = 32;

        const passwordInput = document.createElement('input');
        passwordInput.type = 'password';
        passwordInput.placeholder = 'Password';
        passwordInput.maxLength = 32;

        const loginSubmitButton = document.createElement('button');
        loginSubmitButton.className = 'submit-button';
        loginSubmitButton.textContent = 'Log In';
        loginSubmitButton.onclick = () => handleLoginSubmit(usernameInput.value, passwordInput.value);

        formContainer.appendChild(usernameInput);
        formContainer.appendChild(passwordInput);
        formContainer.appendChild(loginSubmitButton);
    }

    function showCreateUserForm() {
        formContainer.innerHTML = '';

        const usernameInput = document.createElement('input');
        usernameInput.type = 'text';
        usernameInput.placeholder = 'Username';
        usernameInput.maxLength = 32;

        const emailInput = document.createElement('input');
        emailInput.type = 'email';
        emailInput.placeholder = 'Email';
        emailInput.maxLength = 32;

        const passwordInput = document.createElement('input');
        passwordInput.type = 'password';
        passwordInput.placeholder = 'Password';
        passwordInput.maxLength = 32;

        const createUserSubmitButton = document.createElement('button');
        createUserSubmitButton.className = 'submit-button';
        createUserSubmitButton.textContent = 'Create User';
        createUserSubmitButton.onclick = () => handleCreateUserSubmit(usernameInput.value, emailInput.value, passwordInput.value);

        formContainer.appendChild(usernameInput);
        formContainer.appendChild(emailInput);
        formContainer.appendChild(passwordInput);
        formContainer.appendChild(createUserSubmitButton);
    }

    async function handleLoginSubmit(username, password) {
        try {
            const response = await fetch('/api/token/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Login failed');
            }
            const data = await response.json();
            alert('Login successful');
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    }

    async function handleCreateUserSubmit(username, email, password) {
        try {
            const response = await fetch('/api/users/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('User creation failed');
            }
            const data = await response.json();
            alert('User created successfully');
            showLoginForm();
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    }
}
