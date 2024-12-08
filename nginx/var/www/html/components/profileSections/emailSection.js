// profileSections/emailSection.js
import { translate } from '../utils/translate.js';

export function renderEmailForm(userInfo, mainContent, showSection) {
    const form = document.createElement('form');
    const messageElement = document.createElement('p');
    messageElement.className = 'message';

    form.innerHTML = `
        <h2 class="profileH2">${translate('Change Email')}</h2>
        <div class="input-group_profile">
            <label>${translate('New Email')}: </label>
            <input type="email" maxLength="32" placeholder="${translate('New Email')}" required>
        </div>
        <button type="submit" class="confirm-btn">${translate('Update Email')}</button>
    `;
    form.appendChild(messageElement);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newEmail = form.querySelector('input').value;
        try {
            const response = await fetch('/api/users/me/', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: newEmail }),
                credentials: 'include'
            });

            if (response.ok) {
                userInfo.email = newEmail;
                messageElement.className = 'success-message';
                messageElement.textContent = translate('Email updated successfully.');
                setTimeout(() => showSection('User Info'), 1500);
            } else {
                const data = await response.json();
                messageElement.className = 'error-message';
                messageElement.textContent = translate(data.email?.[0] || data.user?.email?.[0] || 'Failed to update email.');
            }
        } catch (error) {
            console.error('Error updating email:', error);
            messageElement.className = 'error-message';
            messageElement.textContent = translate('Error updating email');
        }
    });

    mainContent.appendChild(form);
}
