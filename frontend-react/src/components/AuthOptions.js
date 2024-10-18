import React, { useState } from 'react';
import axios from 'axios';
import './AuthOptions.css';

function AuthOptions() {
  const [formType, setFormType] = useState(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLoginClick = () => {
    setFormType('login');
  };

  const handleCreateUserClick = () => {
    setFormType('createUser');
  };

  const handleLoginSubmit = async () => {
    try {
      const response = await axios.post('https://127.0.0.1:8000/token/', {
        username,
        password,
      });
      console.log('Login successful:', response.data);
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  const handleCreateUserSubmit = async () => {
    try {
      const response = await axios.post('https://127.0.0.1:8000/users/register/', {
        username,
        email,
        password,
      });
      console.log('User created successfully:', response.data);
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  return (
    <div className="auth-options">
      <div className="auth-buttons">
        <button className="auth-button" onClick={handleLoginClick}>Log In</button>
        <button className="auth-button" onClick={handleCreateUserClick}>Create User</button>
      </div>
      
      {formType === 'login' && (
        <table className="auth-table">
          <tbody>
            <tr>
              <td><input type="text" placeholder="Username or Email" value={username} onChange={(e) => setUsername(e.target.value)} /></td>
            </tr>
            <tr>
              <td><input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} /></td>
            </tr>
            <tr>
              <td><button className="submit-button" onClick={handleLoginSubmit}>Log In</button></td>
            </tr>
          </tbody>
        </table>
      )}

      {formType === 'createUser' && (
        <table className="auth-table">
          <tbody>
            <tr>
              <td><input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} /></td>
            </tr>
            <tr>
              <td><input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} /></td>
            </tr>
            <tr>
              <td><input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} /></td>
            </tr>
            <tr>
              <td><button className="submit-button" onClick={handleCreateUserSubmit}>Create User</button></td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AuthOptions;