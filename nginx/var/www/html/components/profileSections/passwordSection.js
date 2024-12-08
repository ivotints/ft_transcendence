// profileSections/passwordSection.js
import { translate } from '../utils/translate.js';

export function renderPasswordForm(mainContent, showSection) {
    const form = document.createElement('form');
    const messageElement = document.createElement('p');
    messageElement.className = 'error-message';
    messageElement.style.cssText = 'display: none; text-align: left;';

    form.innerHTML = `
        <h2 class="profileH2">${translate('Change Password')}</h2>
        <div class="input-group_profile">
            <label>${translate('Old Password')}: </label>
            <input type="password" maxLength="32" placeholder="${translate('Old Password')}" required>
        </div>
        <div class="input-group_profile">
            <label>${translate('New Password')}: </label>
            <input type="password" maxLength="32" placeholder="${translate('New Password')}" required>
        </div>
        <div class="input-group_profile">
            <label>${translate('Confirm Password')}: </label>
            <input type="password" maxLength="32" placeholder="${translate('Confirm Password')}" required>
        </div>
        <button type="submit" class="confirm-btn">${translate('Update Password')}</button>
    `;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        messageElement.style.display = 'none';

        const [oldPassword, newPassword, confirmPassword] =
            [...form.querySelectorAll('input')].map(input => input.value);

        if (newPassword !== confirmPassword) {
            messageElement.textContent = translate('Passwords do not match');
            messageElement.style.display = 'block';
            return;
        }

        try {
            const response = await fetch('/api/users/me/', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    old_password: oldPassword,
                    password: newPassword
                }),
                credentials: 'include'
            });

            if (response.ok) {
                messageElement.className = 'success-message';
                messageElement.textContent = translate('Password updated successfully');
                messageElement.style.display = 'block';
                setTimeout(() => showSection('User Info'), 1500);
            } else {
                const data = await response.json();
                messageElement.className = 'error-message';
                if (data.password && data.password.password) {
                    messageElement.textContent = translate(data.password.password);
                } else if (data.password && Array.isArray(data.password)) {
                    messageElement.textContent = translate(data.password[0]);
                } else if (data.old_password && data.old_password[0]) {
                    messageElement.textContent = translate(data.old_password[0]);
                } else {
                    messageElement.textContent = translate(data.detail || 'Failed to update password');
                }
                messageElement.style.display = 'block';
            }
        } catch (error) {
            console.error('Error updating password:', error);
            messageElement.className = 'error-message';
            messageElement.textContent = translate('Error updating password');
            messageElement.style.display = 'block';
        }
    });

    form.appendChild(messageElement);
    mainContent.appendChild(form);
}
