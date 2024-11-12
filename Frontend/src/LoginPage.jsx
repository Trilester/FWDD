import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

function LoginPage() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [resetVisible, setResetVisible] = useState(false); 
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    
    try {
      const response = await fetch('http://localhost:8081/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emailOrUsername, password }),
      });

      if (response.ok) {
        const data = await response.json();
        alert("Login successful!");

        localStorage.setItem("username", data.username);

        navigate('/');
      } else {
        alert("Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("An error occurred. Please try again later.");
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    
    if (newPassword !== confirmNewPassword) {
      alert("New passwords do not match.");
      return;
    }
    
    try {
      const response = await fetch('http://localhost:8081/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emailOrUsername, currentPassword, newPassword }),
      });

      if (response.ok) {
        alert("Password reset successful!");
        setResetVisible(false); 
        alert("Password reset failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Error during password reset:", error);
      alert("An error occurred. Please try again later.");
    }
  };

  const Register = () => {
    navigate('/register'); 
  };

  return (
    <div className="login-container">
      {!resetVisible ? ( 
        <>
          <h1>Login</h1>
          <form onSubmit={handleLogin} className="login-form">
            <div>
              <label>Email or Username:</label>
              <input 
                type="text" 
                value={emailOrUsername} 
                onChange={(e) => setEmailOrUsername(e.target.value)} 
                required 
              />
            </div>
            <div>
              <label>Password:</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
            <div className="button-container">
              <button type="submit">Login</button>
              <button type="button" onClick={() => setResetVisible(true)}>Reset Password</button>
              <button type="button" onClick={Register}>Register</button>
            </div>
          </form>
        </>
      ) : (
        <div>
          <h2>Reset Password</h2>
          <form onSubmit={handleResetPassword} className="reset-password-form">
            <div>
              <label>Email or Username:</label>
              <input 
                type="text" 
                value={emailOrUsername} 
                onChange={(e) => setEmailOrUsername(e.target.value)} 
                required 
              />
            </div>
            <div>
              <label>Current Password:</label>
              <input 
                type="password" 
                value={currentPassword} 
                onChange={(e) => setCurrentPassword(e.target.value)} 
                required 
              />
            </div>
            <div>
              <label>New Password:</label>
              <input 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                required 
              />
            </div>
            <div>
              <label>Confirm New Password:</label>
              <input 
                type="password" 
                value={confirmNewPassword} 
                onChange={(e) => setConfirmNewPassword(e.target.value)} 
                required 
              />
            </div>
            <div className="button-container">
              <button type="submit">Reset Password</button>
              <button type="button" onClick={() => setResetVisible(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default LoginPage;