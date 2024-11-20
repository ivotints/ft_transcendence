// auth.js
import { setLoggedIn } from './state.js';
import { header } from '../header.js';
import { homePage } from '../homePage.js';

export function authForms() {
  const container = document.createElement('div');
  container.className = 'auth-options';

  // State variables
  let formType = null;
  let username = '';
  let email = '';
  let password = '';
  let errorMessage = '';

  // Buttons container
  const buttonsDiv = document.createElement('div');
  buttonsDiv.className = 'auth-buttons';

  // Login button
  const loginButton = document.createElement('button');
  loginButton.className = 'auth-button';
  loginButton.textContent = 'Log In';
  loginButton.addEventListener('click', () => {
    formType = 'login';
    renderForm();
  });
  buttonsDiv.appendChild(loginButton);

  // Create User button
  const createUserButton = document.createElement('button');
  createUserButton.className = 'auth-button';
  createUserButton.textContent = 'Create User';
  createUserButton.addEventListener('click', () => {
    formType = 'createUser';
    renderForm();
  });
  buttonsDiv.appendChild(createUserButton);

  // Optional OAuth button (if needed)
  /*
  const oauthButton = document.createElement('button');
  oauthButton.className = 'auth-button';
  oauthButton.textContent = '42';
  oauthButton.addEventListener('click', () => {
    window.location.href = '/api/oauth/redirect/';
  });
  buttonsDiv.appendChild(oauthButton);
  */

  container.appendChild(buttonsDiv);

  // Form container
  const formContainer = document.createElement('div');
  formContainer.className = 'form-container';
  container.appendChild(formContainer);

  // Error message container
  const errorMessageDiv = document.createElement('div');
  errorMessageDiv.className = 'error-message';
  container.appendChild(errorMessageDiv);

  // Function to render the appropriate form
  function renderForm() {
    formContainer.innerHTML = '';
    errorMessageDiv.textContent = '';

    const table = document.createElement('table');
    table.className = 'auth-table';

    const tbody = document.createElement('tbody');

    // Username row
    const usernameRow = document.createElement('tr');
    const usernameCell = document.createElement('td');
    const usernameInput = document.createElement('input');
    usernameInput.type = 'text';
    usernameInput.maxLength = 32;
    usernameInput.placeholder = 'Username';
    usernameInput.value = username;
    usernameInput.required = true;
    usernameInput.addEventListener('input', (e) => {
      username = e.target.value;
    });
    usernameCell.appendChild(usernameInput);
    usernameRow.appendChild(usernameCell);
    tbody.appendChild(usernameRow);

    // Email row (only for registration)
    let emailInput;
    if (formType === 'createUser') {
      const emailRow = document.createElement('tr');
      const emailCell = document.createElement('td');
      emailInput = document.createElement('input');
      emailInput.type = 'email';
      emailInput.maxLength = 32;
      emailInput.placeholder = 'Email';
      emailInput.value = email;
      emailInput.required = true;
      emailInput.addEventListener('input', (e) => {
        email = e.target.value;
      });
      emailCell.appendChild(emailInput);
      emailRow.appendChild(emailCell);
      tbody.appendChild(emailRow);
    }

    // Password row
    const passwordRow = document.createElement('tr');
    const passwordCell = document.createElement('td');
    const passwordInput = document.createElement('input');
    passwordInput.type = 'password';
    passwordInput.maxLength = 32;
    passwordInput.placeholder = 'Password';
    passwordInput.value = password;
    passwordInput.required = true;
    passwordInput.addEventListener('input', (e) => {
      password = e.target.value;
    });
    passwordCell.appendChild(passwordInput);
    passwordRow.appendChild(passwordCell);
    tbody.appendChild(passwordRow);

    // Submit button row
    const submitRow = document.createElement('tr');
    const submitCell = document.createElement('td');
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.className = 'submit-button';
    submitButton.textContent = formType === 'login' ? 'Log In' : 'Create User';
    submitCell.appendChild(submitButton);
    submitRow.appendChild(submitCell);
    tbody.appendChild(submitRow);

    table.appendChild(tbody);
    formContainer.appendChild(table);

    // Form submission handler
    if (formType === 'login') {
      submitButton.addEventListener('click', handleLoginSubmit);
    } else if (formType === 'createUser') {
      submitButton.addEventListener('click', handleCreateUserSubmit);
    }
  }

  // Function to handle login form submission
  async function handleLoginSubmit(event) {
    event.preventDefault();
    errorMessageDiv.textContent = '';

    try {
      const response = await fetch('/api/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        console.log('Login successful');
        setLoggedIn(true);
        // Re-render header and home page
        document.querySelector('.header').replaceWith(await header());
        document.querySelector('.home-page').replaceWith(await homePage());
      } else {
        const errorData = await response.json();
        if (errorData.password) {
          errorMessage = `Error: ${errorData.password[0]}`;
        } else {
          errorMessage = `Error: ${errorData.detail || 'An error occurred'}`;
        }
        errorMessageDiv.textContent = errorMessage;
      }
    } catch (error) {
      console.error('Error logging in:', error);
      errorMessageDiv.textContent = 'Error: Network error';
    }
  }

  // Function to handle registration form submission
  async function handleCreateUserSubmit(event) {
    event.preventDefault();
    errorMessageDiv.textContent = '';

    try {
      const response = await fetch('/api/users/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, email, password })
      });

      if (response.ok) {
        console.log('User created successfully');
        // Automatically log in the user after successful registration
        await handleLogin(username, password);
      } else {
        const errorData = await response.json();
        if (errorData.username) {
          errorMessage = `Username error: ${errorData.username[0]}`;
        } else if (errorData.email) {
          errorMessage = `Email error: ${errorData.email[0]}`;
        } else if (errorData.password) {
          errorMessage = `Password error: ${errorData.password[0]}`;
        } else {
          errorMessage = `Error: ${errorData.detail || 'An error occurred'}`;
        }
        errorMessageDiv.textContent = errorMessage;
      }
    } catch (error) {
      console.error('Error creating user:', error);
      errorMessageDiv.textContent = 'Error: Network error';
    }
  }

  // Function to handle automatic login after registration
  async function handleLogin(usernameParam, passwordParam) {
    try {
      const response = await fetch('/api/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: usernameParam, password: passwordParam })
      });

      if (response.ok) {
        console.log('Login successful');
        setLoggedIn(true);
        // Re-render header and home page
        document.querySelector('.header').replaceWith(await header());
        document.querySelector('.home-page').replaceWith(await homePage());
      } else {
        const errorData = await response.json();
        errorMessage = `Error: ${errorData.detail || 'An error occurred'}`;
        errorMessageDiv.textContent = errorMessage;
      }
    } catch (error) {
      console.error('Error logging in:', error);
      errorMessageDiv.textContent = 'Error: Network error';
    }
  }

  return container;
}
