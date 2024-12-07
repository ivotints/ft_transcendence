// profileSections/passwordSection.js

export function renderPasswordForm(mainContent, showSection) {
    const form = document.createElement('form');
    const messageElement = document.createElement('p');
    messageElement.className = 'error-message';
    messageElement.style.cssText = 'display: none; text-align: left;';

    form.innerHTML = `
        <h2 class="profileH2">Change Password</h2>
        <div class="input-group_profile">
            <label>Old Password: </label>
            <input type="password" maxLength="32" placeholder="Old Password" required>
        </div>
        <div class="input-group_profile">
            <label>New Password: </label>
            <input type="password" maxLength="32" placeholder="New Password" required>
        </div>
        <div class="input-group_profile">
            <label>Confirm Password: </label>
            <input type="password" maxLength="32" placeholder="Confirm Password" required>
        </div>
        <button type="submit" class="confirm-btn">Update Password</button>
    `;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        messageElement.style.display = 'none';

        const [oldPassword, newPassword, confirmPassword] =
            [...form.querySelectorAll('input')].map(input => input.value);

        if (newPassword !== confirmPassword) {
            messageElement.textContent = 'Passwords do not match';
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
                messageElement.textContent = 'Password updated successfully';
                messageElement.style.display = 'block';
                setTimeout(() => showSection('User Info'), 1500);
            } else {
                const data = await response.json();
                messageElement.className = 'error-message';
                if (data.password && data.password.password) {
                    messageElement.textContent = data.password.password;
                } else if (data.password && Array.isArray(data.password)) {
                    messageElement.textContent = data.password[0];
                } else if (data.old_password && data.old_password[0]) {
                    messageElement.textContent = data.old_password[0];
                } else {
                    messageElement.textContent = data.detail || 'Failed to update password';
                }
                messageElement.style.display = 'block';
            }
        } catch (error) {
            console.error('Error updating password:', error);
            messageElement.className = 'error-message';
            messageElement.textContent = 'Error updating password';
            messageElement.style.display = 'block';
        }
    });

    form.appendChild(messageElement);
    mainContent.appendChild(form);
}
