// profileSections/twoFactorSection.js

import { translate } from '../utils/translate.js';

const initialState = {
    selected2FAMethod: '',
    userPhone: '',
    qrCode: '',
    twoFactorMessage: '',
    confirmationOtp: '',
    twoFactorSuccess: '',
    twoFactorError: '',
    otpSecret: ''
};

let state = { ...initialState };
let mainContentRef = null;

async function setup2FA(method) {
    const data = { method };

    if (method === 'sms') {
        data.user_phone = state.userPhone.startsWith('+') ? state.userPhone : `+${state.userPhone}`;
    }

    try {
        const response = await fetch('/api/setup-2fa/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (response.ok) {
            handleSetupSuccess(method, result);
        } else {
            handleError(result);
        }
    } catch (error) {
        console.error('Error setting up 2FA:', error);
        state.twoFactorError = 'Network error occurred during setup.';
    }

    if (mainContentRef) {
        render2FA(mainContentRef);
    }
}

function handleSetupSuccess(method, result) {
    if (method === 'authenticator') {
        state.qrCode = result.qr_code;
        state.twoFactorMessage = '';
    } else {
        const methodMessage = method === 'sms' ? 'OTP has been sent by sms' : `OTP has been sent to your ${method}`;
        state.twoFactorMessage = methodMessage;
    }
    state.otpSecret = result.otp_secret;
}

function handleError(result) {
    state.twoFactorError = result.errors ? result.errors[0] : result.detail || 'An error occurred during setup.';
}

async function confirm2FA(event) {
    event.preventDefault();
    state.twoFactorError = '';
    state.twoFactorSuccess = '';

    const data = {
        method: state.selected2FAMethod,
        code: state.confirmationOtp,
    };

    if (state.selected2FAMethod === 'sms') {
        data.user_phone = state.userPhone;
    }

    try {
        const response = await fetch('/api/setup-2fa/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data),
        });

        const result = await response.json();
        if (response.ok && result.success) {
            state.twoFactorSuccess = '2FA setup successfully.';
            resetState();
        } else {
            state.twoFactorError = result.errors ? result.errors.join(', ') : 'Failed to confirm Two-Factor Authentication.';
        }
    } catch (error) {
        console.error('Error confirming 2FA:', error);
        state.twoFactorError = 'Network error occurred during confirmation.';
    }
    render2FA(mainContentRef);
}

function resetState() {
    state = { ...initialState };
}

export function render2FA(mainContent) {
    mainContentRef = mainContent;
    mainContent.innerHTML = '';

    const twoFactorDiv = createTwoFactorDiv();
    mainContent.appendChild(twoFactorDiv);
}

function createTwoFactorDiv() {
    const div = document.createElement('div');
    div.className = 'two-factor-container';

    if (!state.selected2FAMethod) {
        renderMethodSelection(div);
    } else {
        renderMethodSetup(div);
    }

    return div;
}

function renderMethodSelection(container) {
    container.innerHTML = `
        <h2 class="profileH2">${translate('2-Factor Authentication')}</h2>
        <div class="two-factor-options">
            <button class="confirm-btn" data-method="authenticator">${translate('Setup with Authenticator App')}</button>
            <button class="confirm-btn" data-method="sms">${translate('Setup with SMS')}</button>
            <button class="confirm-btn" data-method="email">${translate('Setup with Email')}</button>
        </div>
    `;

    container.querySelectorAll('.confirm-btn').forEach(button => {
        button.addEventListener('click', () => {
            state.selected2FAMethod = button.getAttribute('data-method');
            render2FA(mainContentRef);
        });
    });
}

function renderMethodSetup(container) {
    container.innerHTML = `
        <h2 class="profileH2">${translate('Setup')} ${capitalizeFirstLetter(state.selected2FAMethod)} ${translate('Authentication')}</h2>
    `;

    if (state.selected2FAMethod === 'authenticator') {
        renderAuthenticatorSetup(container);
    } else if (state.selected2FAMethod === 'sms') {
        renderSmsSetup(container);
    } else if (state.selected2FAMethod === 'email') {
        renderEmailSetup(container);
    }

    if (state.twoFactorMessage || state.qrCode) {
        renderVerificationForm(container);
    }

    const backButton = document.createElement('button');
    backButton.className = 'back-btn';
    backButton.textContent = translate('Back');
    backButton.addEventListener('click', () => {
        resetState();
        render2FA(mainContentRef);
    });
    container.appendChild(backButton);

    renderMessages(container);
}

function renderAuthenticatorSetup(container) {
    if (!state.qrCode) {
        const generateButton = document.createElement('button');
        generateButton.className = 'confirm-btn';
        generateButton.textContent = translate('Generate QR Code');
        generateButton.addEventListener('click', () => setup2FA('authenticator'));
        container.appendChild(generateButton);
    } else {
        const qrSection = document.createElement('div');
        qrSection.className = 'qr-code-section';
        qrSection.innerHTML = `
            <p>${translate('Scan the QR code with your authenticator app:')}</p>
            <div class="qr-code-display">${state.qrCode}</div>
        `;
        container.appendChild(qrSection);
    }
}

function renderSmsSetup(container) {
    const phoneSection = document.createElement('div');
    phoneSection.className = 'phone-input-section';
    phoneSection.innerHTML = `
        <input type="text" placeholder="${translate('Enter phone number')}" maxLength="15" value="${state.userPhone}">
        <button class="confirm-btn">${translate('Send Code')}</button>
    `;

    const phoneInput = phoneSection.querySelector('input');
    phoneInput.addEventListener('input', (e) => {
        state.userPhone = e.target.value;
    });

    const sendButton = phoneSection.querySelector('button');
    sendButton.addEventListener('click', () => setup2FA('sms'));
    container.appendChild(phoneSection);
}

function renderEmailSetup(container) {
    const emailSection = document.createElement('div');
    emailSection.className = 'email-section';

    const emailButton = document.createElement('button');
    emailButton.className = 'confirm-btn';
    emailButton.textContent = translate('Send Code via Email');
    emailButton.addEventListener('click', () => setup2FA('email'));

    emailSection.appendChild(emailButton);
    container.appendChild(emailSection);
}

function renderVerificationForm(container) {
    const form = document.createElement('form');
    form.className = 'verification-form';
    form.innerHTML = `
        <input type="text" maxLength="6" placeholder="${translate('Enter verification code')}" value="${state.confirmationOtp}">
        <button type="submit" class="confirm-btn">${translate('Verify')}</button>
    `;

    form.querySelector('input').addEventListener('input', (e) => {
        state.confirmationOtp = e.target.value;
    });

    form.addEventListener('submit', confirm2FA);
    container.appendChild(form);
}

function renderMessages(container) {
    if (state.twoFactorMessage) {
        const message = document.createElement('p');
        message.className = 'message';
        message.textContent = translate(state.twoFactorMessage);
        container.appendChild(message);
    }

    if (state.twoFactorSuccess) {
        const successMessage = document.createElement('p');
        successMessage.className = 'success-message';
        successMessage.textContent = translate(state.twoFactorSuccess);
        container.appendChild(successMessage);
    }

    if (state.twoFactorError) {
        const errorMessage = document.createElement('p');
        errorMessage.className = 'error-message';
        errorMessage.textContent = translate(state.twoFactorError);
        container.appendChild(errorMessage);
    }
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
