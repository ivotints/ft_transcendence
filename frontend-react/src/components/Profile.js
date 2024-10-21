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
  const [acceptedFriends, setAcceptedFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [friendUsername, setFriendUsername] = useState(''); // State for friend's username

  useEffect(() => {
    console.log('Component mounted, fetching data...');
    // Fetch user profile data
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get('https://localhost:8000/profiles/me/', { withCredentials: true });
        const profile = response.data;
        setUserInfo({
          username: profile.user.username,
          email: profile.user.email,
        });
        setAvatar(profile.avatar);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (activeSection === 'pendingRequests') {
      console.log('Fetching pending requests for pendingRequests section...');
      const fetchPendingRequests = async () => {
        try {
          const response = await axios.get('https://localhost:8000/friends/pending/', { withCredentials: true });
          console.log('Pending friends response:', response.data);
          setPendingRequests(response.data);
        } catch (error) {
          console.error('Error fetching pending friend requests:', error);
        }
      };

      fetchPendingRequests();
    }
  }, [activeSection]);

  useEffect(() => {
    if (activeSection === 'friendList') {
      console.log('Fetching accepted friends for friendList section...');
      const fetchAcceptedFriends = async () => {
        try {
          const response = await axios.get('https://localhost:8000/friends/accepted/', { withCredentials: true });
          console.log('Accepted friends response:', response.data);
          setAcceptedFriends(response.data);
        } catch (error) {
          console.error('Error fetching accepted friends:', error);
        }
      };

      fetchAcceptedFriends();
    }
  }, [activeSection]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('avatar', file);

      try {
        const response = await axios.patch('https://localhost:8000/profiles/me/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        });
        setAvatar(response.data.avatar);
      } catch (error) {
        console.error('Error updating avatar:', error);
      }
    }
  };

  const handleEmailChange = async (e) => {
    e.preventDefault();
    const newEmail = e.target.newEmail.value;

    try {
      await axios.patch('https://localhost:8000/profiles/me/', { user: { email: newEmail } }, { withCredentials: true });
      setUserInfo((prev) => ({ ...prev, email: newEmail }));
    } catch (error) {
      console.error('Error updating email:', error);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const newPassword = e.target.newPassword.value;

    try {
      await axios.patch('https://localhost:8000/profiles/me/', { user: { password: newPassword } }, { withCredentials: true });
    } catch (error) {
      console.error('Error updating password:', error);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await axios.patch(`https://localhost:8000/friends/${requestId}/`, { status: 'accepted' }, { withCredentials: true });
      setPendingRequests((prev) => prev.filter((request) => request.id !== requestId));
      setAcceptedFriends((prev) => [...prev, { ...prev.find((request) => request.id === requestId), status: 'accepted' }]);
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await axios.patch(`https://localhost:8000/friends/${requestId}/`, { status: 'rejected' }, { withCredentials: true });
      setPendingRequests((prev) => prev.filter((request) => request.id !== requestId));
    } catch (error) {
      console.error('Error rejecting friend request:', error);
    }
  };

  const handleAddFriend = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://localhost:8000/friends/', { friend_username: friendUsername }, { withCredentials: true });
      setFriendUsername(''); // Clear the input field after successful request
      // Optionally, you can refetch pending requests or show a success message
      console.log('Friend request sent:', response.data);
    } catch (error) {
      console.error('Error sending friend request:', error.response.data);
    }
  };

  const renderContent = () => {
    console.log('Rendering content for section:', activeSection);
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
            <form onSubmit={handleAddFriend}>
              <label>Friend's Name: </label>
              <input
                type="text"
                value={friendUsername}
                onChange={(e) => setFriendUsername(e.target.value)}
                placeholder="Friend's Name"
              />
              <br />
              <button className="confirm-btn" type="submit">Confirm</button>
            </form>
          </div>
        );
      case 'friendList':
        console.log('Accepted friends state:', acceptedFriends); // Log the accepted friends state
        return (
          <div>
            <h2 className="profileH2">Friend List</h2>
            <ul>
              {acceptedFriends.map((friend) => (
                <li key={friend.id}>
                  {friend.user_detail.username === userInfo.username ? friend.friend_detail.username : friend.user_detail.username}
                </li>
              ))}
            </ul>
          </div>
        );
      case 'pendingRequests':
        return (
          <div>
            <h2 className="profileH2">Pending Friend Requests</h2>
            <ul>
              {pendingRequests.map((request) => (
                <li key={request.id}>
                  {request.user.username}
                  <button onClick={() => handleAcceptRequest(request.id)}>Accept</button>
                  <button onClick={() => handleRejectRequest(request.id)}>Reject</button>
                </li>
              ))}
            </ul>
          </div>
        );
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
          <li onClick={() => setActiveSection('pendingRequests')}>Pending Friend Requests</li>
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