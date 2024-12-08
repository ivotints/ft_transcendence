// profileSections/userInfoSection.js
import { translate } from '../utils/translate.js';

export function renderUserInfo(userInfo, mainContent) {
    const userInfoDiv = document.createElement('div');
    userInfoDiv.innerHTML = `
        <h2 class="profileH2">${translate('User Info')}</h2>
        <p>${translate('Username')}: ${userInfo.username}</p>
        <p>${translate('Email')}: ${userInfo.email}</p>

        <h3 class="profileH2">${translate('Player Statistics')}</h3>
        <h4>${translate('Pong Game')}</h4>
        <p>${translate('Wins')}: ${userInfo.wins}</p>
        <p>${translate('Losses')}: ${userInfo.losses}</p>

        <h4>${translate('Cowboy Game')}</h4>
        <p>${translate('Wins')}: ${userInfo.cowboyWins}</p>
        <p>${translate('Losses')}: ${userInfo.cowboyLosses}</p>
    `;

    const avatarContainer = document.createElement('div');
    avatarContainer.className = 'avatar-container';

    const avatar = document.createElement('img');
    const avatarUrl = userInfo.avatar
        ? (userInfo.avatar.startsWith('http') ? userInfo.avatar : `${window.location.origin}${userInfo.avatar}`)
        : 'https://img.freepik.com/free-vector/mysterious-gangster-character_23-2148483453.jpg';
    avatar.src = avatarUrl;
    avatar.alt = translate('Avatar');
    avatar.className = 'avatar';

    const label = document.createElement('label');
    label.className = 'change-avatar-label';

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.className = 'avatar-upload';
    fileInput.maxLength = 320;

    const changeAvatarText = document.createElement('p');
    changeAvatarText.className = 'change-avatar-text';
    changeAvatarText.textContent = translate('Change Avatar');

    const errorContainer = document.createElement('div');
    const errorMessage = document.createElement('p');
    errorMessage.className = 'error-message';
    errorMessage.style.display = 'none';
    errorContainer.appendChild(errorMessage);

    fileInput.addEventListener('change', (e) => handleAvatarChange(e, userInfo));

    label.appendChild(fileInput);
    label.appendChild(changeAvatarText);

    avatarContainer.appendChild(avatar);
    avatarContainer.appendChild(label);
    avatarContainer.appendChild(errorContainer);

    userInfoDiv.appendChild(avatarContainer);
    mainContent.appendChild(userInfoDiv);
}

async function handleAvatarChange(e, userInfo) {
    const file = e.target.files[0];
    if (file) {
        const formData = new FormData();
        formData.append('avatar', file);

        const errorElement = document.querySelector('.error-message');
        const avatar = document.querySelector('.avatar');

        try {
            const response = await fetch('/api/profiles/me/', {
                method: 'PATCH',
                body: formData,
                credentials: 'include'
            });

            if (!response.ok) {
                const data = await response.json();
                errorElement.textContent = translate(data.avatar?.[0] || 'Error uploading avatar');
                errorElement.style.display = 'block';
                return;
            }

            const data = await response.json();
            if (data && data.avatar) {
                userInfo.avatar = data.avatar;
                avatar.src = data.avatar.startsWith('http') ? data.avatar : `${window.location.origin}${data.avatar}`;
                errorElement.style.display = 'none';
            } else {
                throw new Error(translate('Avatar property is missing in the response'));
            }
        } catch (error) {
            console.error('Error updating avatar:', error);
            errorElement.textContent = translate('Error updating avatar');
            errorElement.style.display = 'block';
        }
    }
}
