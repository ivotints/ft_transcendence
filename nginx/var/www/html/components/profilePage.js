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
			showSection('User Info');
		} catch (error) {
			console.error('Error fetching user data:', error);
		}
	}

	function showSection(sectionName) {
		mainContent.innerHTML = '';
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
			// Add other section handlers
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

		const avatar = document.createElement('img');
		avatar.src = userInfo.avatar || 'default-avatar.jpg';
		avatar.alt = 'Avatar';
		avatar.className = 'avatar';

		const fileInput = document.createElement('input');
		fileInput.type = 'file';
		fileInput.accept = 'image/*';
		fileInput.className = 'avatar-upload';
		fileInput.addEventListener('change', handleAvatarChange);

		avatarContainer.appendChild(avatar);
		avatarContainer.appendChild(fileInput);
		userInfoDiv.appendChild(avatarContainer);

		mainContent.appendChild(userInfoDiv);
	}

	async function handleAvatarChange(e) {
		const file = e.target.files[0];
		if (file) {
			const formData = new FormData();
			formData.append('avatar', file);

			try {
				const response = await fetch('/api/profiles/me/', {
					method: 'PATCH',
					body: formData,
					credentials: 'include'
				});
				const data = await response.json();
				userInfo.avatar = data.avatar;
				showSection('User Info');
			} catch (error) {
				console.error('Error updating avatar:', error);
			}
		}
	}

	function renderEmailForm() {
		const form = document.createElement('form');
		form.innerHTML = `
            <h2 class="profileH2">Change Email</h2>
            <input type="email" placeholder="New Email" required>
            <button type="submit">Update Email</button>
        `;

		form.addEventListener('submit', async (e) => {
			e.preventDefault();
			const newEmail = form.querySelector('input').value;
			try {
				const response = await fetch('/api/users/me/', {
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ email: newEmail }),
					credentials: 'include'
				});
				if (response.ok) {
					userInfo.email = newEmail;
					showSection('User Info');
				}
			} catch (error) {
				console.error('Error updating email:', error);
			}
		});

		mainContent.appendChild(form);
	}

	function renderPasswordForm() {
		const form = document.createElement('form');
		form.innerHTML = `
            <h2 class="profileH2">Change Password</h2>
            <input type="password" placeholder="Old Password" required>
            <input type="password" placeholder="New Password" required>
            <input type="password" placeholder="Confirm Password" required>
            <button type="submit">Update Password</button>
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

	// Initial load
	await fetchUserData();

	return container;
}

