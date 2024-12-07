// profileSections/twoFactorSection.js

let state = {
    selected2FAMethod: '',
    userPhone: '',
    qrCode: '',
    twoFactorMessage: '',
    confirmationOtp: '',
    twoFactorSuccess: '',
    twoFactorError: '',
    otpSecret: ''
};

// Keep track of mainContent reference
let mainContentRef = null;

async function setup2FA(method) {
    const data = { method: method };
    if (method === 'sms') {
        data.user_phone = state.userPhone.startsWith('+') ? state.userPhone : "+" + state.userPhone;
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
            if (method === 'authenticator') {
                state.qrCode = result.qr_code;
                state.twoFactorMessage = '';
            } else if (method === 'sms') {
                state.twoFactorMessage = 'OTP has been sent by sms';
            } else {
                state.twoFactorMessage = 'OTP has been sent to your ' + method;
            }
            state.otpSecret = result.otp_secret;
        } else {
            state.twoFactorError = result.errors ? result.errors[0] : result.detail || 'An error occurred during setup.';
        }
    } catch (error) {
        console.error('Error setting up 2FA:', error);
        state.twoFactorError = 'Network error occurred during setup.';
    }
    // Use stored mainContentRef
    if (mainContentRef) {
        render2FA(mainContentRef);
    }
}

async function confirm2FA(event, mainContent) {
    event.preventDefault();
    state.twoFactorError = '';
    state.twoFactorSuccess = '';

    try {
        const data = {
            method: state.selected2FAMethod,
            code: state.confirmationOtp,
        };

        if (state.selected2FAMethod === 'sms') {
            data.user_phone = state.userPhone;
        }

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
    render2FA(mainContent);
}

function resetState() {
    state = {
        selected2FAMethod: '',
        qrCode: '',
        confirmationOtp: '',
        twoFactorMessage: '',
        userPhone: '',
        twoFactorSuccess: '',
        twoFactorError: '',
        otpSecret: ''
    };
}

export function render2FA(mainContent) {
    // Store the reference when render2FA is called
    mainContentRef = mainContent;
    mainContent.innerHTML = '';
    const twoFactorDiv = document.createElement('div');
    twoFactorDiv.className = 'two-factor-container';

    if (!state.selected2FAMethod) {
        twoFactorDiv.innerHTML = `
            <h2 class="profileH2">2-Factor Authentication</h2>
            <div class="two-factor-options">
                <button class="confirm-btn" data-method="authenticator">Setup with Authenticator App</button>
                <button class="confirm-btn" data-method="sms">Setup with SMS</button>
                <button class="confirm-btn" data-method="email">Setup with Email</button>
            </div>
        `;

        const methodButtons = twoFactorDiv.querySelectorAll('.confirm-btn');
        methodButtons.forEach(button => {
            button.addEventListener('click', () => {
                state.selected2FAMethod = button.getAttribute('data-method');
                render2FA(mainContent);
            });
        });
    } else {
        twoFactorDiv.innerHTML = `
            <h2 class="profileH2">Setup ${capitalizeFirstLetter(state.selected2FAMethod)} Authentication</h2>
        `;

        if (state.selected2FAMethod === 'authenticator') {
            if (!state.qrCode) {
                const generateButton = document.createElement('button');
                generateButton.className = 'confirm-btn';
                generateButton.id = 'generate-qr';
                generateButton.textContent = 'Generate QR Code';
                generateButton.addEventListener('click', () => setup2FA('authenticator'));
                twoFactorDiv.appendChild(generateButton);
            } else {
                const qrSection = document.createElement('div');
                qrSection.className = 'qr-code-section';
                qrSection.innerHTML = `
                    <p>Scan the QR code with your authenticator app:</p>
                    <div class="qr-code-display"></div>
                `;
                const qrDisplay = qrSection.querySelector('.qr-code-display');
                qrDisplay.innerHTML = state.qrCode;
                twoFactorDiv.appendChild(qrSection);
            }
        } else if (state.selected2FAMethod === 'sms') {
            const phoneSection = document.createElement('div');
            phoneSection.className = 'phone-input-section';
            phoneSection.innerHTML = `
                <input type="text" placeholder="Enter phone number" maxLength="15" value="${state.userPhone}">
                <button class="confirm-btn">Send Code</button>
            `;
            const phoneInput = phoneSection.querySelector('input');
            const sendButton = phoneSection.querySelector('button');

            phoneInput.addEventListener('input', (e) => {
                state.userPhone = e.target.value;
            });

            sendButton.addEventListener('click', () => setup2FA('sms'));
            twoFactorDiv.appendChild(phoneSection);
        } else if (state.selected2FAMethod === 'email') {
            const emailButton = document.createElement('button');
            emailButton.className = 'confirm-btn';
            emailButton.id = 'send-email';
            emailButton.textContent = 'Send Code via Email';
            emailButton.addEventListener('click', () => setup2FA('email'));
            twoFactorDiv.appendChild(emailButton);
        }

        if (state.twoFactorMessage || state.qrCode) {
            const verificationForm = document.createElement('form');
            verificationForm.className = 'verification-form';
            verificationForm.innerHTML = `
                <input type="text" maxLength="32" placeholder="Enter verification code" maxLength="6">
                <button type="submit" class="confirm-btn">Verify</button>
            `;

            const input = verificationForm.querySelector('input');
            input.addEventListener('input', (e) => {
                state.confirmationOtp = e.target.value;
            });

            verificationForm.addEventListener('submit', (e) => confirm2FA(e, mainContent));
            twoFactorDiv.appendChild(verificationForm);
        }

        const backButton = document.createElement('button');
        backButton.className = 'back-btn';
        backButton.textContent = 'Back';
        backButton.addEventListener('click', () => {
            resetState();
            render2FA(mainContent);
        });
        twoFactorDiv.appendChild(backButton);

        // Display messages
        [
            { text: state.twoFactorMessage, className: 'message' },
            { text: state.twoFactorSuccess, className: 'success-message' },
            { text: state.twoFactorError, className: 'error-message' }
        ].forEach(({ text, className }) => {
            if (text) {
                const para = document.createElement('p');
                para.className = className;
                para.textContent = text;
                twoFactorDiv.appendChild(para);
            }
        });
    }

    mainContent.appendChild(twoFactorDiv);
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
