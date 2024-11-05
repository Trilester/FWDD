import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [resetVisible, setResetVisible] = useState(false); // State for reset password visibility
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

        // Store the username in local storage
        localStorage.setItem("username", data.username);

        // Navigate to the homepage after login
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
        setResetVisible(false); // Hide reset form after success
        // Optionally, you might want to clear the input fields here
      } else {
        alert("Password reset failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Error during password reset:", error);
      alert("An error occurred. Please try again later.");
    }
  };

  return (
    <div>
      {!resetVisible ? ( // Conditional rendering based on resetVisible
        <>
          <h1>Login</h1>
          <form onSubmit={handleLogin}>
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
            <button type="submit">Login</button>
          </form>
          <button onClick={() => setResetVisible(true)}>Reset Password</button>
        </>
      ) : (
        <div>
          <h2>Reset Password</h2>
          <form onSubmit={handleResetPassword}>
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
            <button type="submit">Reset Password</button>
            <button type="button" onClick={() => setResetVisible(false)}>Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default LoginPage;
