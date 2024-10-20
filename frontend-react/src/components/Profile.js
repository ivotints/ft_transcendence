import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Profile.css';

function Profile() {
  const [activeSection, setActiveSection] = useState('info');
  const [avatar, setAvatar] = useState(null);
  const [userInfo, setUserInfo] = useState({
    username: '',
    email: '',
  });
  const [profileId, setProfileId] = useState(null);

  useEffect(() => {
    // Fetch user profile data
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get('https://localhost:8000/profiles/me/', { withCredentials: true });
        const profile = response.data;
        setUserInfo({
          username: profile.user.username,
          email: profile.user.email,
        });
        setAvatar(profile.avatar_url);
        setProfileId(profile.id);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file && profileId) {
      const formData = new FormData();
      formData.append('avatar', file);

      try {
        const response = await axios.patch(`https://localhost:8000/profiles/me/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        });
        setAvatar(response.data.avatar_url);
      } catch (error) {
        console.error('Error updating avatar:', error);
      }
    }
  };

  const handleEmailChange = async (e) => {
    e.preventDefault();
    const newEmail = e.target.newEmail.value;

    try {
      await axios.patch(`https://localhost:8000/profiles/me/`, { user: { email: newEmail } }, { withCredentials: true });
      setUserInfo((prev) => ({ ...prev, email: newEmail }));
    } catch (error) {
      console.error('Error updating email:', error);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const newPassword = e.target.newPassword.value;

    try {
      await axios.patch(`https://localhost:8000/profiles/me/`, { user: { password: newPassword } }, { withCredentials: true });
    } catch (error) {
      console.error('Error updating password:', error);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'changeEmail':
        return (
          <div>
            <h2 className="profileH2">Change Email</h2>
            <form onSubmit={handleEmailChange}>
              <label>New Email: </label>
              <input type="email" name="newEmail" placeholder="New Email" />
              <br />
              <button className="confirm-btn" type="submit">Confirm</button>
            </form>
          </div>
        );
      case 'changePassword':
        return (
          <div>
            <h2 className="profileH2">Change Password</h2>
            <form onSubmit={handlePasswordChange}>
              <label>New Password: </label>
              <input type="password" name="newPassword" placeholder="New Password" />
              <br />
              <button className="confirm-btn" type="submit">Confirm</button>
            </form>
          </div>
        );
      case 'addFriend':
        return (
          <div>
            <h2 className="profileH2">Add Friend</h2>
            <label>Friend's Name: </label>
            <input type="text" placeholder="Friend's Name" />
            <br />
            <button className="confirm-btn">Confirm</button>
          </div>
        );
      case 'friendList':
        return <h2 className="profileH2">Friend List</h2>;
      case 'matchHistory':
        return (
          <div>
            <h2 className="profileH2">Match History</h2>
            <label htmlFor="match-type">Select Match Type: </label>
            <select id="match-type" className="dropdown">
              <option value="1v1">1 vs 1</option>
              <option value="tournament">Tournament</option>
            </select>
          </div>
        );
      case 'info':
      default:
        return (
          <div className="user-info">
            <h2 className="profileH2">User Info</h2>
            <p>Username: {userInfo.username}</p>
            <p>Email: {userInfo.email}</p>
          </div>
        );
    }
  };

  return (
    <div className="user-container">
      <div className="sidebar">
        <ul>
          <li onClick={() => setActiveSection('info')}>User Info</li>
          <li onClick={() => setActiveSection('changeEmail')}>Change Email</li>
          <li onClick={() => setActiveSection('changePassword')}>Change Password</li>
          <li onClick={() => setActiveSection('addFriend')}>Add Friend</li>
          <li onClick={() => setActiveSection('friendList')}>Friend List</li>
          <li onClick={() => setActiveSection('matchHistory')}>Match History</li>
        </ul>
      </div>
      
      <div className="avatar-container">
        <img 
          src={avatar || 'https://img.freepik.com/free-vector/mysterious-gangster-character_23-2148483453.jpg?t=st=1728555835~exp=1728559435~hmac=d755d92883b6e90517bb85a9f4873282fbf000290f17eeddd79afdcddaee9ac7&w=826'} 
          alt="Avatar" 
          className="avatar"
        />
        <label className="change-avatar-label">
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="avatar-upload"
          />
          <p className="change-avatar-text">Change Avatar</p>
        </label>
      </div>

      <div className="user-info">
        {renderContent()}
      </div>
    </div>
  );
}

export default Profile;