import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Profile.css';
import { useTranslate } from './Translate/useTranslate';

function Profile() {
  const [activeSection, setActiveSection] = useState('info');
  const [avatar, setAvatar] = useState(null);
  const [userInfo, setUserInfo] = useState({
    username: '',
    email: '',
  });
  const [acceptedFriends, setAcceptedFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [friendUsername, setFriendUsername] = useState('');
  const [matchType, setMatchType] = useState('1v1');
  const [matchHistory, setMatchHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [messagePass, setMessagePass] = useState('');
  const [messagePassType, setMessagePassType] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const { translate } = useTranslate();  // Get translate function from the hook

  const [errorKey, setErrorKey] = useState(''); // State to store error key
  const translatedErrorMessage = errorKey ? translate(errorKey) : ''; // Derived variable for translation

  const [errorKeyMail, setErrorKeyMail] = useState(''); // State to store error key
  const translatedErrorMessageMail = errorKeyMail ? translate(errorKeyMail) : ''; // Derived variable for translation

  const [errorKeyFriend, setErrorKeyFriend] = useState(''); // State to store error key
  const translatedErrorMessageFriend = errorKeyFriend ? translate(errorKeyFriend) : ''; // Derived variable for translation

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

  useEffect(() => {
    if (activeSection === 'matchHistory') {
      const fetchMatchHistory = async () => {
        setLoading(true);
        try {
          let response;
          if (matchType === '1v1') {
            response = await axios.get('https://localhost:8000/matches/', { withCredentials: true });
          } else if (matchType === 'tournament') {
            response = await axios.get('https://localhost:8000/tournaments/', { withCredentials: true });
          }
          setMatchHistory(response.data);
        } catch (error) {
          console.error('Error fetching match history:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchMatchHistory();
    }
  }, [activeSection, matchType]);

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

    try {
      await axios.patch('https://localhost:8000/profiles/me/', { user: { email: newEmail } }, { withCredentials: true });

      // Update userInfo state with new email and set success message
      setUserInfo((prev) => ({ ...prev, email: newEmail }));
      setMessage(translate('Email') + translate('updated successfully.'));
      setMessageType('success');
      setNewEmail(''); // Clear the input field after submission
      setErrorKeyMail('');
    } catch (error) {
      console.error('Error updating email:', error);

      // Set error message on failure
      setErrorKeyMail('Failed to update email. Please try again.');
      setMessageType('error');
    }
  };


  const handlePasswordChange = async (e) => {
    e.preventDefault();

    try {
      await axios.patch('https://localhost:8000/profiles/me/', { user: { password: newPassword } }, { withCredentials: true });

      // Set success message
      setMessagePass(translate('Password') + translate('updated successfully.'));
      setMessagePassType('success');
      setNewPassword(''); // Clear the input field after submission
      setErrorKey(''); // Clear error key on success
    } catch (error) {
      console.error('Error updating password:', error);

      // Set error key instead of hard-coded message
      setErrorKey('Failed to update password. Please try again.');
      setMessagePassType('error');
    }
  };

  const handleAddFriend = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://localhost:8000/friends/', { friend_username: friendUsername }, { withCredentials: true });
      setFriendUsername(''); // Clear the input field after successful request
      // Optionally, you can refetch pending requests or show a success message
      console.log('Friend request sent:', response.data);
      setErrorKeyFriend('');
    } catch (error) {
      setErrorKeyFriend('Failed to update friend. Please try again.');
      console.error('Error sending friend request:', error.response.data);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const response = await axios.patch(`https://localhost:8000/friends/${requestId}/`, { status: 'accepted' }, { withCredentials: true });
      const acceptedFriend = response.data;

      setPendingRequests((prev) => prev.filter((request) => request.id !== requestId));
      setAcceptedFriends((prev) => [...prev, acceptedFriend]);
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



  const handleMatchTypeChange = (e) => {
    setMatchType(e.target.value);
  };

  const renderContent = () => {
    console.log('Rendering content for section:', activeSection);
    switch (activeSection) {
      case 'changeEmail':
        return (
          <div>
            <h2 className="profileH2">{translate('Change Email')}</h2>
            <form onSubmit={handleEmailChange}>
              <label>{translate('New Email')}: </label>
              <input
                type="email"
                name="newEmail"
                autoComplete="off"
                placeholder={translate('New Email')}
                value={newEmail} // Controlled input
                onChange={(e) => setNewEmail(e.target.value)} // Update state on input change
              />
              <br />
              <button className="confirm-btn" type="submit">{translate('Confirm')}</button>
            </form>
            {translatedErrorMessageMail && (
  <p className={messagePassType === 'success' ? 'success-message' : 'error-message'}>
    {translatedErrorMessageMail}
              </p>
            )}
          </div>
        );
      case 'changePassword':
        return (
          <div>
            <h2 className="profileH2">{translate('Change Password')}</h2>
            <form onSubmit={handlePasswordChange}>
              <label>{translate('New Password')}: </label>
              <input
                type="password"
                name="newPassword"
                autoComplete="new-password"
                placeholder={translate('New Password')}
                value={newPassword} // Controlled input
                onChange={(e) => setNewPassword(e.target.value)} // Update state on input change
              />
              <br />
              <button className="confirm-btn" type="submit">{translate('Confirm')}</button>
            </form>
           {translatedErrorMessage && (
  <p className={messagePassType === 'success' ? 'success-message' : 'error-message'}>
    {translatedErrorMessage}
  </p>
)}
          </div>
        );
      case 'addFriend':
        return (
          <div>
            <h2 className="profileH2">{translate('Add Friend')}</h2>
            <form onSubmit={handleAddFriend}>
              <label>{translate("Friend's Name")}: </label>
              <input
                type="text"
                value={friendUsername}
                onChange={(e) => setFriendUsername(e.target.value)}
                placeholder={translate("Friend's Name")}
              />
              <br />
              <button className="confirm-btn" type="submit">{translate('Confirm')}</button>
            </form>
            {translatedErrorMessageFriend && (
  <p className={messagePassType === 'success' ? 'success-message' : 'error-message'}>
    {translatedErrorMessageFriend}
    </p>
)}
          </div>
        );
        case 'friendList':
          console.log('Accepted friends state:', acceptedFriends);
          return (
            <div>
              <h2 className="profileH2">{translate('Friend List')}</h2>
              <ul className="friend-list">
                {acceptedFriends.map((friend) => {
                  const username = friend.user_detail?.username === userInfo.username
                    ? friend.friend_detail?.username
                    : friend.user_detail?.username;

                  return (
                    <li key={friend.id} className="friend-list-item">
                      <span className="friend-username">{username || 'Unknown User'}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        case 'pendingRequests':
          return (
            <div>
              <h2 className="profileH2">{translate('Pending Friend Requests')}</h2>
              <ul className="pending-requests-list">
                {pendingRequests.map((request) => (
                  <li key={request.id} className="pending-request-item">
                    <span className="pending-request-username">{request.user_detail.username}</span>
                    <div className="pending-request-buttons">
                      <button className="accept-btn" onClick={() => handleAcceptRequest(request.id)}>{translate('Accept')}</button>
                      <button className="reject-btn" onClick={() => handleRejectRequest(request.id)}>{translate('Reject')}</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
          case 'matchHistory':
            return (
              <div className="match-history">
                <h2 className="profileH2">{translate('Match History')}</h2>
                <label htmlFor="match-type">{translate('Select Match Type')}: </label>
                <select id="match-type" className="dropdown" value={matchType} onChange={handleMatchTypeChange}>
                  <option value="1v1">{translate('1 vs 1')}</option>
                  <option value="tournament">{translate('Tournament')}</option>
                </select>
                {loading ? (
                  <p>{translate('Loading')}...</p>
                ) : (
                  matchType === 'tournament' ? (
                    <ul>
                      {matchHistory.map((tournament) => (
                        <li key={tournament.tournament_id} className="tournament">
                          <p><strong>{translate('Name')}:</strong> {tournament.name}</p>
                          <p><strong>{translate('Match Date')}:</strong> {new Date(tournament.match_date).toLocaleDateString()}</p>
                          <p><strong>{translate('Winners Order')}:</strong> {Array.isArray(tournament.winners_order) ? tournament.winners_order.join(', ') : (tournament.winners_order && tournament.winners_order.error ? tournament.winners_order.error : 'N/A')}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <ul>
                      {matchHistory.map((match) => (
                        <li key={match.id}>
                          <p><strong>{translate('Player')}1:</strong> {match.player1_username}</p>
                          <p><strong>{translate('Player')}2:</strong> {match.player2}</p>
                          <p><strong>{translate('Winner')}:</strong> {match.winner}</p>
                          <p><strong>{translate('Match Date')}:</strong> {new Date(match.match_date).toLocaleDateString()}</p>
                          <p><strong>{translate('Match score')}:</strong> {match.match_score}</p>
                        </li>
                      ))}
                    </ul>
                  )
                )}
              </div>
            );
      case 'info':
      default:
        return (
          <div className="user-info">
            <h2 className="profileH2">{translate('User Info')}</h2>
            <p>{translate('Username')}: {userInfo.username}</p>
            <p>{translate('Email')}: {userInfo.email}</p>
          </div>
        );
    }
  };

  return (
    <div className="user-container">
      <div className="sidebar">
        <ul>
          <li onClick={() => setActiveSection('info')}>{translate('User Info')}</li>
          <li onClick={() => setActiveSection('changeEmail')}>{translate('Change Email')}</li>
          <li onClick={() => setActiveSection('changePassword')}>{translate('Change Password')}</li>
          <li onClick={() => setActiveSection('addFriend')}>{translate('Add Friend')}</li>
          <li onClick={() => setActiveSection('friendList')}>{translate('Friend List')}</li>
          <li onClick={() => setActiveSection('pendingRequests')}>{translate('Pending Friend Requests')}</li>
          <li onClick={() => setActiveSection('matchHistory')}>{translate('Match History')}</li>
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
          <p className="change-avatar-text">{translate('Change Avatar')}</p>
        </label>
      </div>

      <div className="user-info">
        {renderContent()}
      </div>
    </div>
  );
}

export default Profile;
