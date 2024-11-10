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
  const [winCount, setWinCount] = useState(0);
  const [lossCount, setLossCount] = useState(0);
  const [cowboyWinCount, setCowboyWinCount] = useState(0);
  const [cowboyLossCount, setCowboyLossCount] = useState(0);
  const [acceptedFriends, setAcceptedFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [friendUsername, setFriendUsername] = useState('');
  const [matchType, setMatchType] = useState('1v1');
  const [matchHistory, setMatchHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { translate } = useTranslate();  // Get translate function from the hook
  const [translatedMessagePass2, setTranslatedMessagePass] = useState('');

  const [message, setMessage] = useState('');
  const translatedMessageMail = message ? translate(message) : '';
  const [messageType, setMessageType] = useState('');

  const [messagePass, setMessagePass] = useState('');
  const translatedMessagePass = messagePass ? translate(messagePass) : '';
  const [messagePassType, setMessagePassType] = useState('');

  const [messageFriend, setMessageFriend] = useState('');
  const translatedMessageFriend = messageFriend ? translate(messageFriend) : '';
  const [messageFriendType, setMessageFriendType] = useState('');

  const [selected2FAMethod, setSelected2FAMethod] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [otpSecret, setOtpSecret] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [twoFactorMessage, setTwoFactorMessage] = useState('');
  const [confirmationOtp, setConfirmationOtp] = useState('');
  const [twoFactorSuccess, setTwoFactorSuccess] = useState('');
  const [twoFactorError, setTwoFactorError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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
        setWinCount(profile.wins);
        setLossCount(profile.losses);
        setCowboyWinCount(profile.cowboy_wins);
        setCowboyLossCount(profile.cowboy_losses);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (activeSection === "twoFactorAuth") {
      setSelected2FAMethod(''); // Reset to default view with 3 buttons
      setTwoFactorError('');
      setTwoFactorSuccess('');
      setUserPhone('');
      setTwoFactorMessage('');
      setConfirmationOtp('')
    }
  }, [activeSection]);

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
          } else if (matchType === '2v2') {
            response = await axios.get('https://localhost:8000/matches/2v2/', { withCredentials: true });
          } else if (matchType === 'tournament') {
            response = await axios.get('https://localhost:8000/tournaments/', { withCredentials: true });
          } else if (matchType === 'cowboy') {
            response = await axios.get('https://localhost:8000/matches/cowboy', { withCredentials: true });
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
        setErrorMessage('');
      } catch (error) {
        console.error('Error updating avatar:', error);
        if (error.response && error.response.data) {
          const errorMsg = error.response.data.avatar ? error.response.data.avatar[0] : 'An unexpected error occurred. Please try again.';
          setErrorMessage(errorMsg);
        } else {
          setErrorMessage('An unexpected error occurred. Please try again.');
        }
      }
    }
  };


  const handleEmailChange = async (e) => {
    e.preventDefault();

    try {
      await axios.patch('https://localhost:8000/users/me/', { email: newEmail }, { withCredentials: true });

      // Update userInfo state with new email and set success message
      setUserInfo((prev) => ({ ...prev, email: newEmail }));
      setMessageType('success');
      setMessage('Email updated successfully.');
      setNewEmail(''); // Clear the input field after submission
    } catch (error) {

      //console.error('Error updating email:', error);
      //console.log('Error response:', error.response); // Check if response exists
      //console.log('Error response data:', error.response?.data); // Inspect data in the response

      setMessageType('error');
      if (error.response.data.email) {
        setMessage(error.response.data.email[0]);
      } else {
        setMessage(error.response.data.user.email[0]);
      }
      //setMessage('Failed to update email. Please try again.');
    }
  };


  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      // Set error message if passwords don't match
      setMessagePassType('error');
      setMessagePass('Passwords do not match');
      return;
    }

    try {
      await axios.patch('https://localhost:8000/users/me/',
        { password: newPassword, old_password: oldPassword },
        { withCredentials: true }
      );
      setNewPassword('');
      setOldPassword('');
      setConfirmPassword('');
      setMessagePassType('success');
      setMessagePass('Password updated successfully.');
    } catch (error) {
      setMessagePassType('error');
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        if (errorData.password) {
          setMessagePass(errorData.password[0]);
        } else if (errorData.old_password) {
          setMessagePass(errorData.old_password[0]);
        } else if (errorData.user) {
          if (errorData.user.password) {
            setMessagePass(errorData.user.password[0]);
          } else if (errorData.user.old_password) {
            setMessagePass(errorData.user.old_password[0]);
          } else {
            setMessagePass('Failed to update password. Please try again.');
          }
        } else {
          setMessagePass('Failed to update password. Please try again.');
        }
      } else {
        setMessagePass('Failed to update password. Please try again.');
      }
    }
  };

  const handleAddFriend = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://localhost:8000/friends/', { friend_username: friendUsername }, { withCredentials: true });
      setFriendUsername('');
      console.log('Friend request sent:', response.data);
      setMessageFriendType("success")
      setMessageFriend('Friend request sent successfully.');
    } catch (error) {

      //console.error('Full password error object:', error); // Log the entire error
      //console.log('Error response:', error.response); // Check if response exists
      //console.log('Error response data:', error.response?.data); // Inspect data in the response
      //setErrorKeyFriend(error.response.data);
      setMessageFriendType("error")
      setMessageFriend(
        error.response.data.friend_username?.[0] ??
        error.response.data.non_field_errors?.[0] ??
        'Error sending friend request'
      );
      //console.error('Error sending friend request:', error.response.data);
    }
  };

  const handleDeleteFriend = async (friendId) => {
    try {
      await axios.delete(`https://localhost:8000/friends/${friendId}/`, { withCredentials: true });
      // Update the state to remove the deleted friend
      setAcceptedFriends((prevFriends) => prevFriends.filter(friend => friend.id !== friendId));

      console.log('Friend deleted successfully');
    } catch (error) {
      console.error('Error deleting friend:', error);
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

  const setupTwoFactor = async (method) => {
    const data = { method: method };

    try {
      if (method === 'sms') {
        // const params = new URLSearchParams();
        // params.append('To', userPhone);
        // params.append('Channel', method);

        // const response = await axios.post(
        //   `https://verify.twilio.com/v2/Services/${process.env.REACT_APP_TWILIO_VERIFY_SERVICE_SID}/Verifications`,
        //   params.toString(),
        //   {
        //     auth: {
        //       username: process.env.REACT_APP_TWILIO_ACCOUNT_SID,
        //       password: process.env.REACT_APP_TWILIO_AUTH_TOKEN,
        //     },
        //     headers: {
        //       'Content-Type': 'application/x-www-form-urlencoded',
        //     },
        //   }
        // );
        // setTwoFactorMessage('OTP sent successfully.');
        data.user_phone = (userPhone.startsWith('+') ? userPhone : "+" + userPhone);
        const response = await axios.post('https://localhost:8000/setup-2fa/', data, {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        });
        const responseData = response.data;
        setOtpSecret(responseData.otp_secret);
        setTwoFactorMessage('OTP has been sent by sms');
      } else {
        const response = await axios.post('https://localhost:8000/setup-2fa/', data, {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        });
        const responseData = response.data;
        setOtpSecret(responseData.otp_secret);
        setTwoFactorMessage('');
        if (method === 'authenticator') {
          setQrCode(responseData.qr_code);
        } else {
          setQrCode('');
          setTwoFactorMessage('OTP has been sent to your ' + method);
        }
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        setTwoFactorError(error.response.data.errors.join(', '));
      } else {
        setTwoFactorError('An error occurred while setting up 2FA.');
      }
    }
  };

  const confirmTwoFactor = async (event) => {
    event.preventDefault();
    setTwoFactorError('');
    setTwoFactorSuccess('');
    try {
      let response;
      if (selected2FAMethod === 'sms') {
        response = await axios.post('https://localhost:8000/setup-2fa/', {
          method: 'sms',
          user_phone: userPhone,
          code: confirmationOtp,
        }, {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        });

        if (response.data.success) {
          setTwoFactorSuccess('2FA setup successfully.');
        } else {
          setTwoFactorError(response.data.errors.join(', '));
        }
      } else {
        const response = await axios.post('https://localhost:8000/setup-2fa/', {
          method: selected2FAMethod === 'authenticator' ? 'authenticator' : "email",
          code: confirmationOtp,
        }, {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        });
        if (response.data.success) {
          setTwoFactorSuccess('2FA setup successfully.');
        } else {
          setTwoFactorError(response.data.errors.join(', '));
        }
      }

    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        setTwoFactorError(error.response.data.errors.join(', '));
      } else {
        setTwoFactorError('An error occurred.');
      }
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
              <input maxLength={32}
                name="newEmail"
                autoComplete="email"
                id="newEmail"
                placeholder={translate('New Email')}
                value={newEmail} // Controlled input
                onChange={(e) => setNewEmail(e.target.value)} // Update state on input change
              />
              <br />
              <button className="confirm-btn" type="submit">{translate('Confirm')}</button>
            </form>
            {translatedMessageMail && (
              <p className={messageType === 'success' ? 'success-message' : 'error-message'}>
                {translatedMessageMail}
              </p>
            )}
          </div>
        );
        case 'changePassword':
          return (
            <div className="form-container">
              <h2 className="profileH2">{translate('Change Password')}</h2>
              <form onSubmit={handlePasswordChange}>
                <div className="input-group">
                  <label>{translate('Old Password')}: </label>
                  <input
                    maxLength={32}
                    type="password"
                    name="oldPassword"
                    id="oldPassword"
                    autoComplete="old-password"
                    placeholder={translate('Old Password')}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label>{translate('New Password')}: </label>
                  <input
                    maxLength={32}
                    type="password"
                    name="newPassword"
                    id="newPassword"
                    autoComplete="new-password"
                    placeholder={translate('New Password')}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label>{translate('Confirm Password')}: </label>
                  <input
                    maxLength={32}
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    autoComplete="new-password"
                    placeholder={translate('Confirm Password')}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <br />
                <button className="confirm-btn" type="submit">{translate('Confirm')}</button>
              </form>
              {translatedMessagePass && (
                <p className={messagePassType === 'success' ? 'success-message' : 'error-message'}>
                  {translatedMessagePass}
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
              <input maxLength={32}
                type="text"
                value={friendUsername}
                onChange={(e) => setFriendUsername(e.target.value)}
                placeholder={translate("Friend's Name")}
              />
              <br />
              <button className="confirm-btn" type="submit">{translate('Confirm')}</button>
            </form>
            {translatedMessageFriend && (
              <p className={messageFriendType === 'success' ? 'success-message' : 'error-message'}>
                {translatedMessageFriend}
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

                const isOnline = friend.user_detail?.username === userInfo.username
                  ? friend.is_friend_online
                  : friend.is_user_online;

                return (
                  <li key={friend.id} className="friend-list-item">
                    <span className={`status-circle ${isOnline ? 'online' : 'offline'}`}></span>
                    <span className="friend-username">{username || 'Unknown User'}</span>
                    {/* Delete button for each friend */}
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteFriend(friend.id)}
                    >
                      {translate('Delete')}
                    </button>
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
      case 'twoFactorAuth':
        return (
          <div className="two-factor-container">
            <h2 className="profileH2">{translate('2-Factor Authentication')}</h2>
            {!selected2FAMethod && (
              <div className="two-factor-options">
                <button className="confirm-btn" onClick={() => setSelected2FAMethod('authenticator')}>
                  {translate('Setup with Authenticator App')}
                </button>
                <button className="confirm-btn" onClick={() => setSelected2FAMethod('sms')}>
                  {translate('Setup with SMS')}
                </button>
                <button className="confirm-btn" onClick={() => setSelected2FAMethod('email')}>
                  {translate('Setup with Email')}
                </button>
              </div>
            )}

            {selected2FAMethod === 'authenticator' && (
              <div className="two-factor-authenticator">
                <button className="confirm-btn" onClick={() => setupTwoFactor('authenticator')}>
                  {translate('Generate QR Code')}
                </button>
                {qrCode && (
                  <div className="qr-code-section">
                    <p>{translate('Scan the QR code with your authenticator app')}:</p>
                    <div dangerouslySetInnerHTML={{ __html: qrCode }} className="qr-code-display" />
                    <form id="confirm-2fa-form" onSubmit={confirmTwoFactor} className="otp-form">
                      <label htmlFor="otp">{translate('Enter OTP Code')}:</label>
                      <input
                        maxLength={6}
                        type="text"
                        id="otp"
                        name="otp"
                        value={confirmationOtp}
                        onChange={(e) => setConfirmationOtp(e.target.value)}
                        required
                        className="otp-input"
                      />
                      <div className="submit-row">
                        <input type="submit" maxLength={32} className="confirm-btn" value={translate('Submit')} />
                      </div>
                    </form>
                  </div>
                )}
                {twoFactorMessage && <p className="two-factor-message">{translate(twoFactorMessage)}</p>}
              </div>
            )}





            {selected2FAMethod === 'sms' && (
              <div className="two-factor-sms">
                <label>{translate('Enter Mobile Number')}:</label>
                <input
                  maxLength={32}
                  type="text"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  placeholder={translate('Mobile Number')}
                  className="phone-input"
                />
                <button
                  className={`confirm-btn ${!userPhone ? 'disabled' : ''}`}
                  onClick={() => {
                    setUserPhone(userPhone.startsWith('+') ? userPhone : "+" + userPhone);
                    if (!/^\+?[1-9]\d{1,14}$/.test(userPhone)) {
                      setTwoFactorError(translate('Invalid phone number format.'));
                      return;
                    }
                    setTwoFactorError("");
                    setTwoFactorMessage("");
                    setupTwoFactor('sms');
                  }}
                  disabled={!userPhone}
                >
                  {translate('Send OTP via SMS')}
                </button>

                {twoFactorMessage && <p className="two-factor-message">{twoFactorMessage}</p>}
              </div>
            )}





            {selected2FAMethod === 'email' && (
              <div className="two-factor-email">
                <button className="confirm-btn" onClick={() => setupTwoFactor('email')}>
                  {translate('Send OTP via Email')}
                </button>
                {twoFactorMessage && <p className="two-factor-message">{translate(twoFactorMessage)}</p>}
              </div>
            )}

            {(selected2FAMethod === 'sms' || selected2FAMethod === 'email') && (
              <form id="confirm-2fa-form" onSubmit={confirmTwoFactor} className="otp-form">
                <br></br>
                <label htmlFor="otp">{translate('Enter OTP Code')}:</label>
                <input
                  maxLength={6}
                  type="text"
                  id="otp"
                  name="otp"
                  value={confirmationOtp}
                  onChange={(e) => setConfirmationOtp(e.target.value)}
                  required
                  className="otp-input"
                />
                <div className="submit-row">
                  <input type="submit" className="confirm-btn" value={translate('Submit')} />
                </div>
              </form>
            )}

            {twoFactorSuccess && <div className="success-message">{translate(twoFactorSuccess)}</div>}
            {twoFactorError && <div className="error-message">{translate(twoFactorError)}</div>}

            {selected2FAMethod && (
              <button
                className="back-button"
                onClick={() => {
                  setSelected2FAMethod('');
                  setTwoFactorError('');
                  setTwoFactorSuccess('');
                  setUserPhone('');
                  setTwoFactorMessage('');
                  setConfirmationOtp('');
                }}
              >
                {translate('Back')}
              </button>
            )}

          </div>
        );
      case 'matchHistory':
        return (
          <div className="match-history">
            <h2 className="profileH2">{translate('Match History')}</h2>
            <label htmlFor="match-type">{translate('Select Match Type')}: </label>
            <select id="match-type" className="dropdown" value={matchType} onChange={handleMatchTypeChange}>
              <option value="1v1">{translate('1 vs 1')}</option>
              <option value="2v2">{translate('2 vs 2')}</option>
              <option value="tournament">{translate('Tournament')}</option>
              <option value="cowboy">{translate('Cowboy Game')}</option>
            </select>
            {loading ? (
              <p>{translate('Loading')}...</p>
            ) : (
              matchType === 'tournament' ? (
                <ul>
                  {matchHistory.map((tournament) => (
                    <li key={tournament.tournament_id} className="tournament">
                      <p><strong>{translate('Tournament Id')}:</strong> {tournament.tournament_id}</p>
                      <p><strong>{translate('Match Date')}:</strong> {new Date(tournament.match_date).toLocaleDateString()}</p>
                      <p><strong>{translate('Winners Order')}:</strong></p>
                      <ul>
                        {Array.isArray(tournament.winners_order_display) ? (
                          tournament.winners_order_display.map((username, index) => (
                            <li key={index}>
                              <strong>
                                {`${index + 1}${translate(index === 0 ? 'st' : index === 1 ? 'nd' : index === 2 ? 'rd' : 'th')} ${translate('Place')}:`}
                              </strong> {username}
                            </li>
                          ))
                        ) : (
                          <li>{tournament.winners_order_display && tournament.winners_order_display.error ? tournament.winners_order_display.error : 'N/A'}</li>
                        )}
                      </ul>
                    </li>
                  ))}
                </ul>
              ) : matchType === '1v1' ? (
                <ul>
                  {matchHistory.map((match) => (
                    <li key={match.id}>
                      <p><strong>{translate('Player')} 1:</strong> {match.player1_username}</p>
                      <p><strong>{translate('Player')} 2:</strong> {match.player2}</p>
                      <p><strong>{translate('Winner')}:</strong> {match.winner}</p>
                      <p><strong>{translate('Match Date')}:</strong> {new Date(match.match_date).toLocaleDateString()}</p>
                      <p><strong>{translate('Match score')}:</strong> {match.match_score}</p>
                    </li>
                  ))}
                </ul>
              ) : matchType === '2v2' ? (
                <ul>
                  {matchHistory.map((match) => (
                    <li key={match.id}>
                      <p><strong>{translate('Player')} 1:</strong> {match.player1_username}</p>
                      <p><strong>{translate('Player')} 2:</strong> {match.player2}</p>
                      <p><strong>{translate('Player')} 3:</strong> {match.player3}</p>
                      <p><strong>{translate('Player')} 4:</strong> {match.player4}</p>
                      <p><strong>{translate('Winner')} 1:</strong> {match.winner1}</p>
                      <p><strong>{translate('Winner')} 2:</strong> {match.winner2}</p>
                      <p><strong>{translate('Match Date')}:</strong> {new Date(match.match_date).toLocaleDateString()}</p>
                      <p><strong>{translate('Match score')}:</strong> {match.match_score}</p>
                    </li>
                  ))}
                </ul>
              ) : matchType === 'cowboy' ? (
                <ul>
                  {matchHistory.map((match) => (
                    <li key={match.id}>
                      <p><strong>{translate('Cowboy')} 1:</strong> {match.player1_username}</p>
                      <p><strong>{translate('Cowboy')} 2:</strong> {match.player2}</p>
                      <p><strong>{translate('Winner')}:</strong> {match.winner}</p>
                      <p><strong>{translate('Match Date')}:</strong> {new Date(match.match_date).toLocaleDateString()}</p>
                      <p><strong>{translate('Match score')}:</strong> {match.match_score}</p>
                    </li>
                  ))}
                </ul>
              ) : null
            )}
          </div>
        );
      case 'info':
      default:
        return (
          <div>
            <div className="user-info">
              <h2 className="profileH2">{translate('User Info')}</h2>
              <p>{translate('Username')}: {userInfo.username}</p>
              <p>{translate('Email')}: {userInfo.email}</p>

              <h3 className="profileH2">{translate('Player Statistics')}</h3>
              <h4 className="profileH2">{translate('Pong Game')}</h4>
              <p>{translate('Wins')}: {winCount}</p>
              <p>{translate('Losses')}: {lossCount}</p>

              <h4 className="profileH2">{translate('Cowboy Game')}</h4>
              <p>{translate('Wins')}: {cowboyWinCount}</p>
              <p>{translate('Losses')}: {cowboyLossCount}</p>
            </div>


            <div className="avatar-container">
              <img
                src={avatar || 'https://img.freepik.com/free-vector/mysterious-gangster-character_23-2148483453.jpg?t=st=1728555835~exp=1728559435~hmac=d755d92883b6e90517bb85a9f4873282fbf000290f17eeddd79afdcddaee9ac7&w=826'}
                alt="Avatar"
                className="avatar"
              />
              <label className="change-avatar-label">
                <input maxLength={320}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="avatar-upload"
                />
                <p className="change-avatar-text">{translate('Change Avatar')}</p>
                <div>
                  {errorMessage && <p className="error-message">{translate(errorMessage)}</p>}
                </div>
              </label>
            </div>
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
          <li onClick={() => setActiveSection('twoFactorAuth')}>{translate('2-Factor Authentication')}</li>
          <li onClick={() => setActiveSection('addFriend')}>{translate('Add Friend')}</li>
          <li onClick={() => setActiveSection('friendList')}>{translate('Friend List')}</li>
          <li onClick={() => setActiveSection('pendingRequests')}>{translate('Pending Friend Requests')}</li>
          <li onClick={() => setActiveSection('matchHistory')}>{translate('Match History')}</li>
        </ul>
      </div>



      <div className="user-info">
        {renderContent()}
      </div>
    </div>
  );
}

export default Profile;