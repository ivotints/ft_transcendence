// auth.js
import { setLoggedIn } from './state.js';
import { header } from '../header.js';
import { homePage } from '../homePage.js';
import { translate } from './translate.js';

let loginTimestamp = null;
const TOKEN_EXPIRY_TIME = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
let refreshIntervalId = null;

let otpRequired = false;
let twoFactorMethods = null;
let otp = '';

export async function refreshToken() {
  console.log('Attempting token refresh at:', new Date().toISOString());

  try {
    const response = await fetch('/api/token/refresh/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      console.log('Token refresh failed:', response.status);
      await handleTokenExpiration();
      return false;
    }

    console.log('Token refresh successful');
    return true;
  } catch (error) {
    console.error('Error refreshing token:', error);
    await handleTokenExpiration();
    return false;
  }
}

export function setupTokenRefresh() {
  console.log('Setting up token refresh interval');

  if (refreshIntervalId) {
    clearInterval(refreshIntervalId);
  }

  loginTimestamp = Date.now();

  refreshIntervalId = setInterval(async () => {
    if (Date.now() - loginTimestamp >= TOKEN_EXPIRY_TIME) {
      console.log('Token expired - logging out');
      await handleTokenExpiration();
      return;
    }

    await refreshToken();
  }, 5 * 60 * 1000); // Refresh every 45 seconds

  refreshToken();

  window.addEventListener('unload', () => {
    if (refreshIntervalId) {
      clearInterval(refreshIntervalId);
    }
  });
}

async function handleTokenExpiration() {
  console.log('Handling token expiration');

  if (refreshIntervalId) {
    clearInterval(refreshIntervalId);
    refreshIntervalId = null;
  }

  loginTimestamp = null;

  setLoggedIn(false);

  try {
    const app = document.getElementById('app');
    if (app) {
      app.innerHTML = '';
      const container = document.createElement('div');
      container.className = 'page-container';

      const headerElement = await header();
      const pageContent = await homePage();

      container.appendChild(headerElement);
      container.appendChild(pageContent);
      app.appendChild(container);
    }
  } catch (error) {
    console.error('Error handling token expiration:', error);
  }
}

export function authForms() {
  const container = document.createElement('div');
  container.className = 'auth-options';

  let formType = null;
  let username = '';
  let email = '';
  let password = '';
  let errorMessage = '';

  const buttonsDiv = document.createElement('div');
  buttonsDiv.className = 'auth-buttons';

  const loginButton = document.createElement('button');
  loginButton.className = 'auth-button';
  loginButton.textContent = translate('Log In');
  loginButton.addEventListener('click', () => {
    formType = 'login';
    otpRequired = false;
    twoFactorMethods = null;
    otp = '';
    renderForm();
  });
  buttonsDiv.appendChild(loginButton);

  const createUserButton = document.createElement('button');
  createUserButton.className = 'auth-button';
  createUserButton.textContent = translate('Create User');
  createUserButton.addEventListener('click', () => {
    formType = 'createUser';
    otpRequired = false;
    twoFactorMethods = null;
    otp = '';
    renderForm();
  });
  buttonsDiv.appendChild(createUserButton);

  const Button42 = document.createElement('button');
  Button42.className = 'auth-button';
  Button42.textContent = '42';

  Button42.addEventListener('click', () => {
    window.location.href = '/api/oauth/redirect/';
    setLoggedIn(1);
  });

  buttonsDiv.appendChild(Button42);

  container.appendChild(buttonsDiv);

  const formContainer = document.createElement('div');
  container.appendChild(formContainer);

  const errorMessageDiv = document.createElement('div');
  errorMessageDiv.className = 'error-message';
  container.appendChild(errorMessageDiv);

  function renderForm() {
    formContainer.innerHTML = '';
    errorMessageDiv.textContent = '';

    const table = document.createElement('table');
    table.className = 'auth-table';

    const tbody = document.createElement('tbody');

    if (!otpRequired) {
      const usernameRow = document.createElement('tr');
      const usernameCell = document.createElement('td');
      const usernameInput = document.createElement('input');
      usernameInput.type = 'text';
      usernameInput.maxLength = 32;
      usernameInput.placeholder = translate('Username');
      usernameInput.value = username;
      usernameInput.required = true;
      usernameInput.setAttribute('required', '');
      usernameInput.addEventListener('input', (e) => {
        username = e.target.value;
      });
      usernameCell.appendChild(usernameInput);
      usernameRow.appendChild(usernameCell);
      tbody.appendChild(usernameRow);

      let emailInput;
      if (formType === 'createUser') {
        const emailRow = document.createElement('tr');
        const emailCell = document.createElement('td');
        emailInput = document.createElement('input');
        emailInput.type = 'email';
        emailInput.maxLength = 32;
        emailInput.placeholder = translate('Email');
        emailInput.value = email;
        emailInput.required = true;
        emailInput.addEventListener('input', (e) => {
          email = e.target.value;
        });
        emailCell.appendChild(emailInput);
        emailRow.appendChild(emailCell);
        tbody.appendChild(emailRow);
      }

      const passwordRow = document.createElement('tr');
      const passwordCell = document.createElement('td');
      const passwordInput = document.createElement('input');
      passwordInput.type = 'password';
      passwordInput.maxLength = 32;
      passwordInput.placeholder = translate('Password');
      passwordInput.value = password;
      passwordInput.required = true;
      passwordInput.addEventListener('input', (e) => {
        password = e.target.value;
      });
      passwordCell.appendChild(passwordInput);
      passwordRow.appendChild(passwordCell);
      tbody.appendChild(passwordRow);

      const submitRow = document.createElement('tr');
      const submitCell = document.createElement('td');
      const submitButton = document.createElement('button');
      submitButton.type = 'submit';
      submitButton.className = 'submit-button';
      submitButton.textContent = translate(formType === 'login' ? 'Log In' : 'Create User');
      submitCell.appendChild(submitButton);
      submitRow.appendChild(submitCell);
      tbody.appendChild(submitRow);

      table.appendChild(tbody);
      formContainer.appendChild(table);

      if (formType === 'login') {
        submitButton.addEventListener('click', async (e) => {
          e.preventDefault();
          if (!username.trim() || !password.trim()) {
            errorMessageDiv.textContent = translate('All fields must be filled out');
            return;
          }
          await handleLoginSubmit(e);
        });
      } else if (formType === 'createUser') {
        submitButton.addEventListener('click', async (e) => {
          e.preventDefault();
          if (!username.trim() || !email.trim() || !password.trim()) {
            errorMessageDiv.textContent = translate('All fields must be filled out');
            return;
          }
          await handleCreateUserSubmit(e);
        });
      }
    } else {
      const otpRow = document.createElement('tr');
      const otpCell = document.createElement('td');
      const otpInput = document.createElement('input');
      otpInput.type = 'text';
      otpInput.maxLength = 6;
      otpInput.placeholder = translate('Enter verification code');
      otpInput.value = otp;
      otpInput.required = true;
      otpInput.setAttribute('required', '');
      otpInput.addEventListener('input', (e) => {
        otp = e.target.value;
      });
      otpCell.appendChild(otpInput);
      otpRow.appendChild(otpCell);
      tbody.appendChild(otpRow);

      if (twoFactorMethods?.sms_enabled || twoFactorMethods?.email_enabled) {
        const sendCodeRow = document.createElement('tr');
        const sendCodeCell = document.createElement('td');
        const sendCodeButton = document.createElement('button');
        sendCodeButton.className = 'send-code';
        sendCodeButton.textContent = translate('Send verification code');
        sendCodeButton.onclick = async () => {
          try {
            const method = twoFactorMethods.email_enabled ? 'email' : 'sms';
            await fetch('/api/send-2fa/', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ username, method })
            });
          } catch (error) {
            console.error('Error sending code:', error);
            errorMessageDiv.textContent = translate('Error sending verification code');
          }
        };
        sendCodeCell.appendChild(sendCodeButton);
        sendCodeRow.appendChild(sendCodeCell);
        tbody.appendChild(sendCodeRow);
      }

      const submitRow = document.createElement('tr');
      const submitCell = document.createElement('td');
      const submitButton = document.createElement('button');
      submitButton.className = 'submit-button';
      submitButton.textContent = 'Verify';
      submitButton.onclick = async () => {
        if (!otp.trim()) {
          errorMessageDiv.textContent = translate('Verification code is required');
          return;
        }
        try {
          let method;
          if (twoFactorMethods.email_enabled) method = 'email';
          else if (twoFactorMethods.sms_enabled) method = 'sms';
          else if (twoFactorMethods.app_enabled) method = 'app';

          const response = await fetch('/api/token/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              username,
              password,
              otp,
              method
            })
          });

          if (response.ok) {
            console.log('2FA verification successful');
            setLoggedIn(true);
            setupTokenRefresh();
            document.querySelector('.header').replaceWith(await header());
            document.querySelector('.home-page').replaceWith(await homePage());
          } else {
            const errorData = await response.json();
            errorMessageDiv.textContent = translate(errorData.detail || 'Verification failed');
          }
        } catch (error) {
          console.error('Error verifying 2FA:', error);
          errorMessageDiv.textContent = translate('Error verifying code');
        }
      };
      submitCell.appendChild(submitButton);
      submitRow.appendChild(submitCell);
      tbody.appendChild(submitRow);
    }

    table.appendChild(tbody);
    formContainer.appendChild(table);
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();
    errorMessageDiv.textContent = '';

    try {
      const twoFactorResponse = await fetch('/api/users-2fa/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username })
      });

      const methods = await twoFactorResponse.json();

      if (methods.app_enabled || methods.sms_enabled || methods.email_enabled) {
        twoFactorMethods = methods;
        otpRequired = true;
        renderForm();
        return;
      }

      const response = await fetch('/api/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        console.log('Login successful at:', new Date().toISOString());
        setLoggedIn(true);
        setupTokenRefresh();
        document.querySelector('.header').replaceWith(await header());
        document.querySelector('.home-page').replaceWith(await homePage());
      } else {
        const errorData = await response.json();
        errorMessage = `${translate("Error")}: ${translate(errorData.detail || 'An error occurred')}`;
        errorMessageDiv.textContent = errorMessage;
      }
    } catch (error) {
      console.error('Error logging in:', error);
      errorMessageDiv.textContent = translate('Error: Network error');
    }
  }

  async function handleCreateUserSubmit(event) {
    event.preventDefault();
    errorMessageDiv.textContent = '';

    if (username.trim().toLowerCase() === 'none') {
        errorMessageDiv.textContent = translate('Username "none" is not allowed');
        return;
    }

    try {
      const response = await fetch('/api/users/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, email, password })
      });

      if (response.ok) {
        console.log('User created successfully');
        await handleLogin(username, password);
      } else {
        const errorData = await response.json();
        if (errorData.password && errorData.password.password) {
          errorMessage = translate(errorData.password.password);
        } else if (errorData.username) {
          errorMessage = `${translate('Username error:')} ${translate(errorData.username[0])}`;
        } else if (errorData.email) {
          errorMessage = `${translate('Email error:')} ${translate(errorData.email[0])}`;
        } else if (errorData.password) {
          errorMessage = `${translate('Password error:')} ${translate(errorData.password[0])}`;
        } else {
          errorMessage = `${translate("Error")}: ${translate(errorData.detail || 'An error occurred')}`;
        }
        errorMessageDiv.textContent = errorMessage;
      }
    } catch (error) {
      console.error('Error creating user:', error);
      errorMessageDiv.textContent = translate('Error: Network error');
    }
  }

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
        document.querySelector('.header').replaceWith(await header());
        document.querySelector('.home-page').replaceWith(await homePage());
      } else {
        const errorData = await response.json();
        errorMessage = `${translate("Error")}: ${translate(errorData.detail || 'An error occurred')}`;
        errorMessageDiv.textContent = errorMessage;
      }
    } catch (error) {
      console.error('Error logging in:', error);
      errorMessageDiv.textContent = translate('Error: Network error');
    }
  }

  return container;
}

export async function logout() {
  console.log('Logging out');

  try {
    if (refreshIntervalId) {
      clearInterval(refreshIntervalId);
      refreshIntervalId = null;
    }

    loginTimestamp = null;

    otpRequired = false;
    twoFactorMethods = null;
    otp = '';

    await fetch('/api/logout/', {
      method: 'POST',
      credentials: 'include'
    });

    setLoggedIn(false);

    const app = document.getElementById('app');
    if (app) {
      app.innerHTML = '';
      const container = document.createElement('div');
      container.className = 'page-container';

      const headerElement = await header();
      const pageContent = await homePage();

      container.appendChild(headerElement);
      container.appendChild(pageContent);
      app.appendChild(container);
    }
  } catch (error) {
    console.error('Error logging out:', error);
  }
}
