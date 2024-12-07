// profilePage.js
import { state } from './utils/state.js';
import { loadAllStyles } from './utils/loadCSS.js';
import { checkLoginStatus } from './utils/state.js';

export async function profilePage() {
	// Check login status and redirect if not logged in
	if (!checkLoginStatus()) {
		window.navigateTo('/');
		return document.createElement('div'); // Return empty div while redirecting
	}

	await loadAllStyles();

	const container = document.createElement('div');
	container.className = 'user-container';

	// Create sidebar
	const sidebar = document.createElement('div');
	sidebar.className = 'sidebar';
	const sidebarList = document.createElement('ul');

	const sections = [
		'User Info',
		'Change Email',
		'Change Password',
		'2-Factor Authentication',
		'Add Friend',
		'Friend List',
		'Pending Requests',
		'Match History'
	];

	sections.forEach(section => {
		const li = document.createElement('li');
		li.textContent = section;
		li.addEventListener('click', () => showSection(section));
		sidebarList.appendChild(li);
	});

	sidebar.appendChild(sidebarList);
	container.appendChild(sidebar);

	// Create main content area
	const mainContent = document.createElement('div');
	mainContent.className = 'user-info';
	container.appendChild(mainContent);

	// Initial data
	let userInfo = {
		username: '',
		email: '',
		avatar: '',
		wins: 0,
		losses: 0,
		cowboyWins: 0,
		cowboyLosses: 0
	};

	let selected2FAMethod = '';
	let userPhone = '';
	let qrCode = '';
	let twoFactorMessage = '';
	let confirmationOtp = '';
	let twoFactorSuccess = '';
	let twoFactorError = '';
	let otpSecret = ''; // Add this line

	// Fetch user data
	async function fetchUserData() {
		try {
			const response = await fetch('/api/profiles/me/', {
				credentials: 'include'
			});
			const data = await response.json();
			userInfo = {
				username: data.user.username,
				email: data.user.email,
				avatar: data.avatar,
				wins: data.wins,
				losses: data.losses,
				cowboyWins: data.cowboy_wins,
				cowboyLosses: data.cowboy_losses
			};
			console.log(data.avatar);
			showSection('User Info');
		} catch (error) {
			console.error('Error fetching user data:', error);
		}
	}

	function showSection(sectionName) {
		mainContent.innerHTML = '';
		// Clear 2FA state when switching to a different section
		if (sectionName !== '2-Factor Authentication') {
			selected2FAMethod = '';
			userPhone = '';
			qrCode = '';
			twoFactorMessage = '';
			confirmationOtp = '';
			twoFactorSuccess = '';
			twoFactorError = '';
			otpSecret = '';
		}

		switch (sectionName) {
			case 'User Info':
				renderUserInfo();
				break;
			case 'Change Email':
				renderEmailForm();
				break;
			case 'Change Password':
				renderPasswordForm();
				break;
			case 'Add Friend':
				renderAddFriendForm();
				break;
			case 'Friend List':
				renderFriendList();
				break;
			case 'Pending Requests':
				renderPendingRequests();
				break;
			case 'Match History':
				renderMatchHistory();
				break;
			case '2-Factor Authentication':
				render2FA();
				break;
		}
	}

	function renderUserInfo() {
		const userInfoDiv = document.createElement('div');
		userInfoDiv.innerHTML = `
			<h2 class="profileH2">User Info</h2>
			<p>Username: ${userInfo.username}</p>
			<p>Email: ${userInfo.email}</p>

			<h3 class="profileH2">Player Statistics</h3>
			<h4>Pong Game</h4>
			<p>Wins: ${userInfo.wins}</p>
			<p>Losses: ${userInfo.losses}</p>

			<h4>Cowboy Game</h4>
			<p>Wins: ${userInfo.cowboyWins}</p>
			<p>Losses: ${userInfo.cowboyLosses}</p>
		`;

		const avatarContainer = document.createElement('div');
		avatarContainer.className = 'avatar-container';

		// Create avatar image element
		const avatar = document.createElement('img');
		const avatarUrl = userInfo.avatar
			? (userInfo.avatar.startsWith('http') ? userInfo.avatar : `${window.location.origin}${userInfo.avatar}`)
			: 'https://img.freepik.com/free-vector/mysterious-gangster-character_23-2148483453.jpg';
		avatar.src = avatarUrl;
		avatar.alt = 'Avatar';
		avatar.className = 'avatar';

		// Create label container for file input
		const label = document.createElement('label');
		label.className = 'change-avatar-label';

		// Create file input
		const fileInput = document.createElement('input');
		fileInput.type = 'file';
		fileInput.accept = 'image/*';
		fileInput.className = 'avatar-upload';
		fileInput.maxLength = 320;

		// Create change avatar text
		const changeAvatarText = document.createElement('p');
		changeAvatarText.className = 'change-avatar-text';
		changeAvatarText.textContent = 'Change Avatar';

		// Create error message container
		const errorContainer = document.createElement('div');
		const errorMessage = document.createElement('p');
		errorMessage.className = 'error-message';
		errorMessage.style.display = 'none';
		errorContainer.appendChild(errorMessage);

		// Add file input event listener using handleAvatarChange
		fileInput.addEventListener('change', handleAvatarChange);

		// Assemble the avatar container
		label.appendChild(fileInput);
		label.appendChild(changeAvatarText);

		avatarContainer.appendChild(avatar);
		avatarContainer.appendChild(label);
		avatarContainer.appendChild(errorContainer);

		userInfoDiv.appendChild(avatarContainer);
		mainContent.appendChild(userInfoDiv);
	}

	async function handleAvatarChange(e) {
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
					errorElement.textContent = data.avatar?.[0] || 'Error uploading avatar';
					errorElement.style.display = 'block';
					return;
				}

				const data = await response.json();
				if (data && data.avatar) {
					userInfo.avatar = data.avatar;
					avatar.src = data.avatar.startsWith('http') ? data.avatar : `${window.location.origin}${data.avatar}`;
					errorElement.style.display = 'none';
				} else {
					throw new Error('Avatar property is missing in the response');
				}
			} catch (error) {
				console.error('Error updating avatar:', error);
				errorElement.textContent = 'Error updating avatar';
				errorElement.style.display = 'block';
			}
		}
	}

	// Add message elements for each form
	function renderEmailForm() {
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

	function renderPasswordForm() {
		const form = document.createElement('form');
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
			const [oldPassword, newPassword, confirmPassword] =
				[...form.querySelectorAll('input')].map(input => input.value);

			if (newPassword !== confirmPassword) {
				alert('Passwords do not match');
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
					showSection('User Info');
				}
			} catch (error) {
				console.error('Error updating password:', error);
			}
		});

		mainContent.appendChild(form);
	}

	function renderAddFriendForm() {
		const form = document.createElement('form');
		form.innerHTML = `
			<h2 class="profileH2">Add Friend</h2>
			<div class="input-group_profile">
				<label>Friend's Name: </label>
				<input type="text" maxLength="32" placeholder="Friend's Name" required>
			</div>
			<button type="submit" class="confirm-btn">Add Friend</button>
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
					messageFriendElement.textContent = data.friend_username?.[0] ||
						data.non_field_errors?.[0] ||
						'Error sending friend request';
					return;
				}

				form.querySelector('input').value = '';
				messageFriendElement.className = 'success-message';
				messageFriendElement.textContent = 'Friend request sent successfully.';

			} catch (error) {
				console.error('Error sending friend request:', error);
				messageFriendElement.className = 'error-message';
				messageFriendElement.textContent = 'Error sending friend request';
			}
		});

		mainContent.appendChild(form);
	}

	function renderFriendList() {
		const friendListDiv = document.createElement('div');
		friendListDiv.innerHTML = `<h2 class="profileH2">Friend List</h2>`;

		const friendList = document.createElement('ul');
		friendList.className = 'friend-list';

		// Fetch and display friends
		fetch('/api/friends/accepted/', { credentials: 'include' })
			.then(response => response.json())
			.then(friends => {
				friends.forEach(friend => {
					const li = document.createElement('li');
					li.className = 'friend-list-item';

					const username = friend.user_detail?.username === userInfo.username
						? friend.friend_detail?.username
						: friend.user_detail?.username;

					const isOnline = friend.user_detail?.username === userInfo.username
						? friend.is_friend_online
						: friend.is_user_online;

					li.innerHTML = `
						<span class="status-circle ${isOnline ? 'online' : 'offline'}"></span>
						<span class="friend-username">${username || 'Unknown User'}</span>
					`;

					const deleteButton = document.createElement('button');
					deleteButton.className = 'delete-btn';
					deleteButton.textContent = 'Delete';
					deleteButton.onclick = () => handleDeleteFriend(friend.id);

					li.appendChild(deleteButton);
					friendList.appendChild(li);
				});
			});

		friendListDiv.appendChild(friendList);
		mainContent.appendChild(friendListDiv);
	}

	function renderPendingRequests() {
		const pendingDiv = document.createElement('div');
		pendingDiv.innerHTML = `<h2 class="profileH2">Pending Friend Requests</h2>`;

		const requestsList = document.createElement('ul');
		requestsList.className = 'pending-requests-list';

		fetch('/api/friends/pending/', { credentials: 'include' })
			.then(response => response.json())
			.then(requests => {
				requests.forEach(request => {
					const li = document.createElement('li');
					li.className = 'pending-request-item';
					li.innerHTML = `
						<span class="pending-request-username">${request.user_detail.username}</span>
						<div class="pending-request-buttons">
							<button class="accept-btn">Accept</button>
							<button class="reject-btn">Reject</button>
						</div>
					`;

					const acceptBtn = li.querySelector('.accept-btn');
					const rejectBtn = li.querySelector('.reject-btn');

					acceptBtn.onclick = () => handleAcceptRequest(request.id);
					rejectBtn.onclick = () => handleRejectRequest(request.id);

					requestsList.appendChild(li);
				});
			});

		pendingDiv.appendChild(requestsList);
		mainContent.appendChild(pendingDiv);
	}

	function renderMatchHistory() {
		const historyDiv = document.createElement('div');
		historyDiv.className = 'match-history';
		historyDiv.innerHTML = `<h2 class="profileH2">Match History</h2>`;

		const selectDiv = document.createElement('div');
		selectDiv.innerHTML = `
			<label for="match-type">Select Match Type: </label>
			<select id="match-type" class="dropdown">
				<option value="1v1">1 vs 1</option>
				<option value="2v2">2 vs 2</option>
				<option value="tournament">Tournament</option>
				<option value="cowboy">Cowboy Game</option>
			</select>
		`;

		const matchList = document.createElement('ul');
		matchList.className = 'match-list';

		const select = selectDiv.querySelector('select');
		select.addEventListener('change', (e) => {
			fetchMatchHistory(e.target.value, matchList);
		});

		historyDiv.appendChild(selectDiv);
		historyDiv.appendChild(matchList);
		mainContent.appendChild(historyDiv);

		// Initial load with 1v1 matches
		fetchMatchHistory('1v1', matchList);
	}

	async function fetchMatchHistory(type, listElement) {
		listElement.innerHTML = '<p>Loading...</p>';

		try {
			let endpoint = '/api/matches/';
			switch (type) {
				case '2v2':
					endpoint = '/api/matches/2v2/';
					break;
				case 'tournament':
					endpoint = '/api/tournaments/';
					break;
				case 'cowboy':
					endpoint = '/api/matches/cowboy/';
					break;
			}

			const response = await fetch(endpoint, { credentials: 'include' });
			const matches = await response.json();

			listElement.innerHTML = '';

			matches.forEach(match => {
				const li = document.createElement('li');

				if (type === 'tournament') {
					li.className = 'tournament';
					li.innerHTML = `
						<p><strong>Tournament Id:</strong> ${match.tournament_id}</p>
						<p><strong>Match Date:</strong> ${new Date(match.match_date).toLocaleDateString()}</p>
						<p><strong>Winners Order:</strong></p>
						<ul>
							${Array.isArray(match.winners_order_display)
							? match.winners_order_display.map((username, index) =>
								`<li><strong>${index + 1}${index === 0 ? 'st' : index === 1 ? 'nd' : index === 2 ? 'rd' : 'th'} Place:</strong> ${username}</li>`
							).join('')
							: '<li>N/A</li>'
						}
						</ul>
					`;
				} else {
					li.innerHTML = `
						<p><strong>Player 1:</strong> ${match.player1_username}</p>
						<p><strong>Player 2:</strong> ${match.player2}</p>
						${type === '2v2' ? `
							<p><strong>Player 3:</strong> ${match.player3}</p>
							<p><strong>Player 4:</strong> ${match.player4}</p>
							<p><strong>Winner 1:</strong> ${match.winner1}</p>
							<p><strong>Winner 2:</strong> ${match.winner2}</p>
						` : `
							<p><strong>Winner:</strong> ${match.winner}</p>
						`}
						<p><strong>Match Date:</strong> ${new Date(match.match_date).toLocaleDateString()}</p>
						<p><strong>Match score:</strong> ${match.match_score}</p>
					`;
				}

				listElement.appendChild(li);
			});
		} catch (error) {
			console.error('Error fetching match history:', error);
			listElement.innerHTML = '<p>Error loading match history</p>';
		}
	}

	async function handleDeleteFriend(friendId) {
		try {
			await fetch(`/api/friends/${friendId}/`, {
				method: 'DELETE',
				credentials: 'include'
			});
			showSection('Friend List'); // Refresh the friend list
		} catch (error) {
			console.error('Error deleting friend:', error);
		}
	}

	async function handleAcceptRequest(requestId) {
		try {
			await fetch(`/api/friends/${requestId}/`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify({ status: 'accepted' })
			});
			showSection('Pending Requests'); // Refresh the pending requests
		} catch (error) {
			console.error('Error accepting friend request:', error);
		}
	}

	async function handleRejectRequest(requestId) {
		try {
			await fetch(`/api/friends/${requestId}/`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify({ status: 'rejected' })
			});
			showSection('Pending Requests'); // Refresh the pending requests
		} catch (error) {
			console.error('Error rejecting friend request:', error);
		}
	}

	async function setup2FA(method) {
		const data = { method: method };
		if (method === 'sms') {
			data.user_phone = userPhone.startsWith('+') ? userPhone : "+" + userPhone;
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
					qrCode = result.qr_code;
					twoFactorMessage = '';
				} else if (method === 'sms') {
					twoFactorMessage = 'OTP has been sent by sms';
				} else {
					twoFactorMessage = 'OTP has been sent to your ' + method;
				}
				otpSecret = result.otp_secret;
			} else {
				// Updated error handling to display errors from response
				twoFactorError = result.errors ? result.errors[0] : result.detail || 'An error occurred during setup.';
			}
		} catch (error) {
			console.error('Error setting up 2FA:', error);
			twoFactorError = 'Network error occurred during setup.';
		}
		render2FA();
	}

	async function confirm2FA(event) {
		event.preventDefault();
		twoFactorError = '';
		twoFactorSuccess = '';

		try {
			const data = {
				method: selected2FAMethod,
				code: confirmationOtp,
			};

			if (selected2FAMethod === 'sms') {
				data.user_phone = userPhone;
			}

			const response = await fetch('/api/setup-2fa/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify(data),
			});

			const result = await response.json();
			if (response.ok && result.success) {
				twoFactorSuccess = '2FA setup successfully.';
				// Reset variables
				selected2FAMethod = '';
				qrCode = '';
				confirmationOtp = '';
				twoFactorMessage = '';
			} else {
				twoFactorError = result.errors ? result.errors.join(', ') : 'Failed to confirm Two-Factor Authentication.';
			}
		} catch (error) {
			console.error('Error confirming 2FA:', error);
			twoFactorError = 'Network error occurred during confirmation.';
		}
		render2FA();
	}

	function render2FA() {
		mainContent.innerHTML = ''; // Clear the main content

		const twoFactorDiv = document.createElement('div');
		twoFactorDiv.className = 'two-factor-container';

		// Initial view with method selection
		if (!selected2FAMethod) {
			twoFactorDiv.innerHTML = `
				<h2 class="profileH2">2-Factor Authentication</h2>
				<div class="two-factor-options">
					<button class="confirm-btn" data-method="authenticator">Setup with Authenticator App</button>
					<button class="confirm-btn" data-method="sms">Setup with SMS</button>
					<button class="confirm-btn" data-method="email">Setup with Email</button>
				</div>
			`;

			// Attach event listeners to method buttons
			const methodButtons = twoFactorDiv.querySelectorAll('.confirm-btn');
			methodButtons.forEach(button => {
				button.addEventListener('click', () => {
					selected2FAMethod = button.getAttribute('data-method');
					render2FA();
				});
			});
		} else {
			// Method-specific setup view
			twoFactorDiv.innerHTML = `
				<h2 class="profileH2">Setup ${capitalizeFirstLetter(selected2FAMethod)} Authentication</h2>
			`;

			if (selected2FAMethod === 'authenticator') {
				if (!qrCode) {
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
					qrDisplay.innerHTML = qrCode; // Assume qrCode contains the SVG or IMG element
					twoFactorDiv.appendChild(qrSection);
				}
			} else if (selected2FAMethod === 'sms') {
				const phoneSection = document.createElement('div');
				phoneSection.className = 'phone-input-section';
				phoneSection.innerHTML = `
					<input type="text" placeholder="Enter phone number" maxLength="15" value="${userPhone}">
					<button class="confirm-btn">Send Code</button>
				`;
				const phoneInput = phoneSection.querySelector('input');
				const sendButton = phoneSection.querySelector('button');

				phoneInput.addEventListener('input', (e) => {
					userPhone = e.target.value;
				});

				sendButton.addEventListener('click', () => setup2FA('sms'));
				twoFactorDiv.appendChild(phoneSection);
			} else if (selected2FAMethod === 'email') {
				const emailButton = document.createElement('button');
				emailButton.className = 'confirm-btn';
				emailButton.id = 'send-email';
				emailButton.textContent = 'Send Code via Email';
				emailButton.addEventListener('click', () => setup2FA('email'));
				twoFactorDiv.appendChild(emailButton);
			}

			// Add verification form if setup is initiated
			if (twoFactorMessage || qrCode) {
				const verificationForm = document.createElement('form');
				verificationForm.className = 'verification-form';
				verificationForm.innerHTML = `
					<input type="text" maxLength="32" placeholder="Enter verification code" maxLength="6">
					<button type="submit" class="confirm-btn">Verify</button>
				`;

				const input = verificationForm.querySelector('input');
				input.addEventListener('input', (e) => {
					confirmationOtp = e.target.value;
				});

				verificationForm.addEventListener('submit', confirm2FA);
				twoFactorDiv.appendChild(verificationForm);
			}

			// Add back button
			const backButton = document.createElement('button');
			backButton.className = 'back-btn';
			backButton.textContent = 'Back';
			backButton.addEventListener('click', () => {
				selected2FAMethod = '';
				qrCode = '';
				twoFactorMessage = '';
				confirmationOtp = '';
				twoFactorSuccess = '';
				twoFactorError = '';
				otpSecret = '';
				render2FA();
			});
			twoFactorDiv.appendChild(backButton);

			// Display messages
			if (twoFactorMessage) {
				const messagePara = document.createElement('p');
				messagePara.className = 'message';
				messagePara.textContent = twoFactorMessage;
				twoFactorDiv.appendChild(messagePara);
			}
			if (twoFactorSuccess) {
				const successPara = document.createElement('p');
				successPara.className = 'success-message';
				successPara.textContent = twoFactorSuccess;
				twoFactorDiv.appendChild(successPara);
			}
			if (twoFactorError) {
				const errorPara = document.createElement('p');
				errorPara.className = 'error-message';
				errorPara.textContent = twoFactorError;
				twoFactorDiv.appendChild(errorPara);
			}
		}

		mainContent.appendChild(twoFactorDiv);
	}

	// Helper function to capitalize the first letter of a string
	function capitalizeFirstLetter(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

	// Initial load
	await fetchUserData();

	return container;
}

