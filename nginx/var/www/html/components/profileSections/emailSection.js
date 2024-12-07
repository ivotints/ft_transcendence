// profileSections/emailSection.js

export function renderEmailForm(userInfo, mainContent, showSection) {
    const form = document.createElement('form');
    const messageElement = document.createElement('p');
    messageElement.className = 'message';

    form.innerHTML = `
        <h2 class="profileH2">Change Email</h2>
        <div class="input-group_profile">
            <label>New Email: </label>
            <input type="email" maxLength="32" placeholder="New Email" required>
        </div>
        <button type="submit" class="confirm-btn">Update Email</button>
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
                messageElement.textContent = 'Email updated successfully.';
                setTimeout(() => showSection('User Info'), 1500);
            } else {
                const data = await response.json();
                messageElement.className = 'error-message';
                messageElement.textContent = data.email?.[0] || data.user?.email?.[0] || 'Failed to update email.';
            }
        } catch (error) {
            console.error('Error updating email:', error);
            messageElement.className = 'error-message';
            messageElement.textContent = 'Error updating email';
        }
    });

    mainContent.appendChild(form);
}
