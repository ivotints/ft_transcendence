import React, { useState } from 'react';
import './Profile.css';

function Profile() {
  const [activeSection, setActiveSection] = useState('info');
  const [avatar, setAvatar] = useState(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const avatarURL = URL.createObjectURL(file);
      setAvatar(avatarURL);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'changeEmail':
        return (
          <div>
            <h2 className="profileH2">Change Email</h2>
            <form>
              <label>Old Email: </label>
              <input type="email" placeholder="Old Email" />
              <br />
              <label>New Email: </label>
              <input type="email" placeholder="New Email" />
              <br />
              <button className="confirm-btn">Confirm</button>
            </form>
          </div>
        );
      case 'changePassword':
        return (
          <div>
            <h2 className="profileH2">Change Password</h2>
            <form>
              <label>Old Password: </label>
              <input type="password" placeholder="Old Password" />
              <br />
              <label>New Password: </label>
              <input type="password" placeholder="New Password" />
              <br />
              <button className="confirm-btn">Confirm</button>
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
            <p>Username: diaraz</p>
            <p>Email: diaraz@example.com</p>
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
