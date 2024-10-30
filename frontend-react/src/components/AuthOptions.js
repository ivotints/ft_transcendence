import React, { useState } from 'react';
import axios from 'axios';
import './AuthOptions.css';
import { useTranslate } from './Translate/useTranslate';

function AuthOptions({ onLoginSuccess }) { // Accept onLoginSuccess as a prop
  const [formType, setFormType] = useState(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { translate } = useTranslate();

  const handleLoginClick = () => {
    setFormType('login');
  };

  const handleCreateUserClick = () => {
    setFormType('createUser');
  };

  const handleLoginSubmit = async () => {
    try {
      const response = await axios.post('https://localhost:8000/token/', {
        username,
        password,
      }, {
        withCredentials: true, // Include cookies in the request
      });
      console.log('Login successful:', response.data);
      onLoginSuccess(); // Notify parent that login was successful
    } catch (error) {
      console.error('Error logging in:', error);
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
      await handleLoginSubmit();
    } catch (error) {
      console.error('Error creating user:', error);
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
      </div>

      {formType === 'login' && (
        <table className="auth-table">
          <tbody>
            <tr>
              <td><input id="username" name="username" maxLength={16} type="text" placeholder={translate("Username")} value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" /></td>
            </tr>
            <tr>
              <td><input  maxLength={16} type="password" placeholder={translate("Password")} value={password} onChange={(e) => setPassword(e.target.value)} /></td>
            </tr>
            <tr>
              <td><button className="submit-button" onClick={handleLoginSubmit}>{translate('Log In')}</button></td>
            </tr>
          </tbody>
        </table>
      )}

      {formType === 'createUser' && (
        <table className="auth-table">
          <tbody>
            <tr>
              <td><input  maxLength={16} type="text" placeholder={translate("Username")} value={username} onChange={(e) => setUsername(e.target.value)} /></td>
            </tr>
            <tr>
              <td><input  maxLength={16} type="email" placeholder={translate("Email")} value={email} onChange={(e) => setEmail(e.target.value)} /></td>
            </tr>
            <tr>
              <td><input  maxLength={16} type="password" placeholder={translate("Password")} value={password} onChange={(e) => setPassword(e.target.value)} /></td>
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
