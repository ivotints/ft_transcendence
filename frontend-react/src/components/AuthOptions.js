import React, { useState } from 'react';
import './AuthOptions.css';

function AuthOptions() {
  const [formType, setFormType] = useState(null);

  const handleLoginClick = () => {
    setFormType('login');
  };

  const handleCreateUserClick = () => {
    setFormType('createUser');
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
              <td><input type="text" placeholder="Username or Email" /></td>
            </tr>
            <tr>
              <td><input type="password" placeholder="Password" /></td>
            </tr>
            <tr>
              <td><button className="submit-button">Log In</button></td>
            </tr>
          </tbody>
        </table>
      )}

      {formType === 'createUser' && (
        <table className="auth-table">
          <tbody>
            <tr>
              <td><input type="text" placeholder="Username" /></td>
            </tr>
            <tr>
              <td><input type="email" placeholder="Email" /></td>
            </tr>
            <tr>
              <td><input type="password" placeholder="Password" /></td>
            </tr>
            <tr>
              <td><button className="submit-button">Create User</button></td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AuthOptions;
