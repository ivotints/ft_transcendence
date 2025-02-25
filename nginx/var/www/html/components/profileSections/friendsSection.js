// profileSections/friendsSection.js
import { translate } from '../utils/translate.js';

export function renderAddFriendForm(mainContent) {
    const form = document.createElement('form');
    form.innerHTML = `
        <h2 class="profileH2">${translate('Add Friend')}</h2>
        <div class="input-group_profile">
            <label>${translate("Friend's Name")}: </label>
            <input type="text" maxLength="32" placeholder="${translate("Friend's Name")}" required>
        </div>
        <button type="submit" class="confirm-btn">${translate('Add Friend')}</button>
    `;

    let messageFriendElement = document.createElement('p');
    messageFriendElement.className = 'message';
    form.appendChild(messageFriendElement);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const friendUsername = form.querySelector('input').value;

        try {
            const response = await fetch('/api/friends/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ friend_username: friendUsername })
            });

            if (!response.ok) {
                const data = await response.json();
                messageFriendElement.className = 'error-message';
                messageFriendElement.textContent = translate(data.friend_username?.[0] ||
                    data.non_field_errors?.[0] ||
                    'Error sending friend request');
                return;
            }

            form.querySelector('input').value = '';
            messageFriendElement.className = 'success-message';
            messageFriendElement.textContent = translate('Friend request sent successfully.');

        } catch (error) {
            console.error('Error sending friend request:', error);
            messageFriendElement.className = 'error-message';
            messageFriendElement.textContent = translate('Error sending friend request');
        }
    });

    mainContent.appendChild(form);
}

export function renderFriendList(mainContent, userInfo, showSection) {
    const friendListDiv = document.createElement('div');
    friendListDiv.innerHTML = `<h2 class="profileH2">${translate('Friend List')}</h2>`;

    const friendList = document.createElement('ul');
    friendList.className = 'friend-list';

    fetch('/api/friends/accepted/', { credentials: 'include' })
        .then(response => response.json())
        .then(friends => {
            friends.forEach(friend => {
                const li = document.createElement('li');
                li.className = 'friend-list-item';

                const isCurrentUser = friend.user_username === userInfo.username;
                const username = isCurrentUser ? friend.friend_username_read_only : friend.user_username;
                const isOnline = isCurrentUser ? friend.is_friend_online : friend.is_user_online;

                li.innerHTML = `
                    <span class="status-circle ${isOnline ? 'online' : 'offline'}"></span>
                    <span class="friend-username">${username || translate('Unknown User')}</span>
                `;

                const deleteButton = document.createElement('button');
                deleteButton.className = 'delete-btn';
                deleteButton.textContent = translate('Delete');
                deleteButton.onclick = () => handleDeleteFriend(friend.id, showSection);

                li.appendChild(deleteButton);
                friendList.appendChild(li);
            });
        });

    friendListDiv.appendChild(friendList);
    mainContent.appendChild(friendListDiv);
}

export function renderPendingRequests(mainContent, showSection) {
    const pendingDiv = document.createElement('div');
    pendingDiv.innerHTML = `<h2 class="profileH2">${translate('Pending Friend Requests')}</h2>`;

    const requestsList = document.createElement('ul');
    requestsList.className = 'pending-requests-list';

    fetch('/api/friends/pending/', { credentials: 'include' })
        .then(response => response.json())
        .then(requests => {
            requests.forEach(request => {
                const li = document.createElement('li');
                li.className = 'pending-request-item';
                li.innerHTML = `
                    <span class="pending-request-username">${request.user_username}</span>
                    <div class="pending-request-buttons">
                        <button class="accept-btn">${translate('Accept')}</button>
                        <button class="reject-btn">${translate('Reject')}</button>
                    </div>
                `;

                const acceptBtn = li.querySelector('.accept-btn');
                const rejectBtn = li.querySelector('.reject-btn');

                acceptBtn.onclick = () => handleAcceptRequest(request.id, showSection);
                rejectBtn.onclick = () => handleRejectRequest(request.id, showSection);

                requestsList.appendChild(li);
            });
        });

    pendingDiv.appendChild(requestsList);
    mainContent.appendChild(pendingDiv);
}

async function handleDeleteFriend(friendId, showSection) {
    try {
        await fetch(`/api/friends/${friendId}/`, {
            method: 'DELETE',
            credentials: 'include'
        });
        showSection('Friend List');
    } catch (error) {
        console.error('Error deleting friend:', error);
    }
}

async function handleAcceptRequest(requestId, showSection) {
    try {
        await fetch(`/api/friends/${requestId}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ status: 'accepted' })
        });
        showSection('Pending Requests');
    } catch (error) {
        console.error('Error accepting friend request:', error);
    }
}

async function handleRejectRequest(requestId, showSection) {
    try {
        await fetch(`/api/friends/${requestId}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ status: 'rejected' })
        });
        showSection('Pending Requests');
    } catch (error) {
        console.error('Error rejecting friend request:', error);
    }
}
