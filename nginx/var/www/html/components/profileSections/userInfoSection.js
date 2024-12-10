// profileSections/userInfoSection.js
import { translate } from '../utils/translate.js';

function constructAvatarUrl(avatarPath) {
    if (!avatarPath) return null;

    const cleanPath = avatarPath.replace(/^https?:\/\/localhost(:\d+)?/, '');

    const normalizedPath = cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath;

    return `https://localhost/api${normalizedPath}`;
}

export function renderUserInfo(userInfo, mainContent) {
    // Create main container
    const userInfoDiv = document.createElement('div');

    // Create info section
    const infoSection = document.createElement('div');
    infoSection.className = 'user-info';
    infoSection.innerHTML = `
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

    // Create avatar container
    const avatarContainer = document.createElement('div');
    avatarContainer.className = 'avatar-container';

    // Create avatar image with console.log
    const avatarImg = document.createElement('img');
    const defaultAvatar = 'https://img.freepik.com/free-vector/mysterious-gangster-character_23-2148483453.jpg?t=st=1728555835~exp=1728559435~hmac=d755d92883b6e90517bb85a9f4873282fbf000290f17eeddd79afdcddaee9ac7&w=826';

    // Use the constructAvatarUrl function
    const avatarUrl = userInfo.avatar ? constructAvatarUrl(userInfo.avatar) : defaultAvatar;
    avatarImg.src = avatarUrl;
    console.log('Initial avatar URL:', avatarUrl);
    avatarImg.alt = 'Avatar';
    avatarImg.className = 'avatar';

    // Create file input label
    const inputLabel = document.createElement('label');
    inputLabel.className = 'change-avatar-label';

    // Create file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.className = 'avatar-upload';
    fileInput.maxLength = 320;

    // Create change avatar text
    const changeAvatarText = document.createElement('p');
    changeAvatarText.className = 'change-avatar-text';
    changeAvatarText.textContent = translate('Change Avatar');

    // Create error message container
    const errorDiv = document.createElement('div');
    const errorMessage = document.createElement('p');
    errorMessage.className = 'error-message';
    errorDiv.appendChild(errorMessage);

    // Handle file upload
    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size before uploading (2MB = 2 * 1024 * 1024 bytes)
            if (file.size > 2 * 1024 * 1024) {
                errorMessage.textContent = translate('File size exceeds 2MB limit');
                return;
            }

            const formData = new FormData();
            formData.append('avatar', file);

            try {
                const response = await fetch('/api/profiles/me/', {
                    method: 'PATCH',
                    body: formData,
                    credentials: 'include'
                });

                let data;
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    data = await response.json();
                } else {
                    throw new Error('File size too large');
                }

                if (!response.ok) {
                    if (data.avatar && data.avatar[0]) {
                        throw new Error(data.avatar[0]);
                    }
                    throw new Error('Upload failed');
                }

                const newAvatarUrl = constructAvatarUrl(data.avatar);
                avatarImg.src = newAvatarUrl;
                console.log('Updated avatar URL:', newAvatarUrl);
                errorMessage.textContent = '';
            } catch (error) {
                console.error('Error updating avatar:', error);
                errorMessage.textContent = translate(error.message);
            }
        }
    });

    // Assemble the components
    inputLabel.appendChild(fileInput);
    inputLabel.appendChild(changeAvatarText);
    inputLabel.appendChild(errorDiv);

    avatarContainer.appendChild(avatarImg);
    avatarContainer.appendChild(inputLabel);

    userInfoDiv.appendChild(infoSection);
    userInfoDiv.appendChild(avatarContainer);

    mainContent.appendChild(userInfoDiv);
}
