import React, { useState } from 'react';
import axios from 'axios';
import './AuthOptions.css';
import { useTranslate } from './Translate/useTranslate';

function AuthOptions({ onLoginSuccess }) { // Accept onLoginSuccess as a prop
  const [formType, setFormType] = useState(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [twoFactorMethods, setTwoFactorMethods] = useState(null);
  const [otpRequired, setOtpRequired] = useState(false); // Added state to track OTP requirement
  const { translate } = useTranslate();

  const handleLoginClick = () => {
    setFormType('login');
  };

  const handleCreateUserClick = () => {
    setFormType('createUser');
  };

  const handleLoginSubmitBefore2fa = async () => {
    try {
      const twoFactorResponse = await axios.post('https://localhost:8000/users-2fa/', { username });
      const methods = twoFactorResponse.data;
      if (methods.app_enabled || methods.sms_enabled || methods.email_enabled) {
        setTwoFactorMethods(methods);
        setOtpRequired(true); // Set OTP requirement to true
      } else {
        const response = await axios.post('https://localhost:8000/token/', {
          username,
          password,
        }, {
          withCredentials: true,
        });
        console.log('Login successful:', response.data);
        onLoginSuccess();
      }
    } catch (error) {
      console.error('Error logging in:', error);
      if (error.response) {
        if (error.response.data.password) {
          setErrorMessage(`Error: ${error.response.data.password[0]}`);
        } else {
          setErrorMessage(`Error: ${error.response.data.detail || 'An error occurred'}`);
        }
      } else if (error.request) {
        console.error('Error request:', error.request);
        setErrorMessage('Error: No response received from server');
      } else {
        console.error('Error message:', error.message);
        setErrorMessage(`Error: ${error.message}`);
      }
    }
  };

  const handleLoginSubmitAfter2fa = async () => {
    try {
      let method;
      if (twoFactorMethods.email_enabled) {
        method = 'email';
      }
      else if (twoFactorMethods.sms_enabled) {
        method = 'sms';
      }
      else if (twoFactorMethods.app_enabled) {
        method = 'app';
      }
      const response = await axios.post('https://localhost:8000/token/', {
        username,
        password,
        otp,
        method
      }, {
        withCredentials: true,
      });
      console.log('Login successful:', response.data);
      onLoginSuccess();
    } catch (error) {
      console.error('Error logging in:', error);
      if (error.response) {
        const errorData = error.response.data;
        if (errorData.username) {
          setErrorMessage(`Username error: ${errorData.username[0]}`);
        } else if (errorData.email) {
          setErrorMessage(`Email error: ${errorData.email[0]}`);
        } else if (errorData.password) {
          setErrorMessage(`Password error: ${errorData.password[0]}`);
        } else {
          setErrorMessage(`Error: ${errorData.detail || 'An error occurred'}`);
        }
      } else if (error.request) {
        console.error('Error request:', error.request);
        setErrorMessage('Error: No response received from server');
      } else {
        console.error('Error message:', error.message);
        setErrorMessage(`Error: ${error.message}`);
      }
    }
  };

  const handleCreateUserSubmit = async () => {
    try {
      const response = await axios.post('https://localhost:8000/users/register/', {
        username,
        email,
        password,
      }, {
        withCredentials: true, // Include cookies in the request
      });
      console.log('User created successfully:', response.data);
      // Automatically log in the user after successful registration
      await handleLoginSubmitBefore2fa();
    } catch (error) {
      console.error('Error creating user:', error);
      if (error.response) {
        const errorData = error.response.data;
        if (errorData.username) {
          setErrorMessage(`Username error: ${errorData.username[0]}`);
        } else if (errorData.email) {
          setErrorMessage(`Email error: ${errorData.email[0]}`);
        } else if (errorData.password) {
          setErrorMessage(`Password error: ${errorData.password[0]}`);
        } else {
          setErrorMessage(`Error: ${errorData.detail || 'An error occurred'}`);
        }
      } else if (error.request) {
        console.error('Error request:', error.request);
        setErrorMessage('Error: No response received from server');
      } else {
        console.error('Error message:', error.message);
        setErrorMessage(`Error: ${error.message}`);
      }
    }
  };

  const handleOAuthClick = () => {
    window.location.href = 'https://localhost:8000/oauth/redirect/';
  };

  const handleSendCodeButtonClick = async () => {
    try {
      const method = twoFactorMethods.email_enabled ? 'email' : 'sms';
      const response = await axios.post('https://localhost:8000/send-2fa/', {
        username,
        method
      }, {
        withCredentials: true,
      });
      console.log('Special endpoint response:', response.data);
    } catch (error) {
      console.error('Error calling special endpoint:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
        setErrorMessage(`Error: ${error.response.data.detail || 'An error occurred'}`);
      } else if (error.request) {
        console.error('Error request:', error.request);
        setErrorMessage('Error: No response received from server');
      } else {
        console.error('Error message:', error.message);
        setErrorMessage(`Error: ${error.message}`);
      }
    }
  };

  return (
    <div className="auth-options">
      <div className="auth-buttons">
        <button className="auth-button" onClick={handleLoginClick}>{translate('Log In')}</button>
        <button className="auth-button" onClick={handleCreateUserClick}>{translate('Create User')}</button>
        <button className="auth-button" onClick={handleOAuthClick}>{translate('42')}</button>
      </div>

      {formType === 'login' && (
        <table className="auth-table">
          <tbody>
            {!otpRequired && (
              <>
                <tr>
                  <td><input id="username" name="username" maxLength={32} type="text" placeholder={translate("Username")} value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" /></td>
                </tr>
                <tr>
                  <td><input  maxLength={32} type="password" placeholder={translate("Password")} value={password} onChange={(e) => setPassword(e.target.value)} /></td>
                </tr>
                <tr>
                  <td><button className="submit-button" onClick={handleLoginSubmitBefore2fa}>{translate('Log In')}</button></td>
                </tr>
              </>
            )}
            {otpRequired && (
              <>
                <tr>
                  <td>
                    <input
                      maxLength={6}
                      type="text"
                      placeholder={translate('Enter OTP')}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                  </td>
                </tr>
                {(twoFactorMethods?.sms_enabled || twoFactorMethods?.email_enabled) && (
                  <tr>
                    <td>
                      <button className="send-code" onClick={handleSendCodeButtonClick}>
                        {translate('Send verification code')}
                      </button>
                    </td>
                  </tr>
                )}
                <tr>
                  <td>
                    <button className="submit-button" onClick={handleLoginSubmitAfter2fa}>
                      {translate('Log In')}
                    </button>
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      )}

      {formType === 'createUser' && (
        <table className="auth-table">
          <tbody>
            <tr>
              <td><input  maxLength={32} type="text" placeholder={translate("Username")} value={username} onChange={(e) => setUsername(e.target.value)} /></td>
            </tr>
            <tr>
              <td><input  maxLength={32} type="email" placeholder={translate("Email")} value={email} onChange={(e) => setEmail(e.target.value)} /></td>
            </tr>
            <tr>
              <td><input  maxLength={32} type="password" placeholder={translate("Password")} value={password} onChange={(e) => setPassword(e.target.value)} /></td>
            </tr>
            <tr>
              <td><button className="submit-button" onClick={handleCreateUserSubmit}>{translate('Create User')}</button></td>
            </tr>
          </tbody>
        </table>
      )}

      {errorMessage && <div className="error-message">{translate(errorMessage)}</div>}
    </div>
  );
}

export default AuthOptions;