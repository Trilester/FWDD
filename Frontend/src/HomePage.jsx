import React, { useEffect, useState } from 'react';
import Button from './Button.jsx';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve the username from local storage
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handlePlayGame = () => {
    navigate('/game');
  };

  const handleLeaderboard = () => {
    navigate('/leaderboard');
  };

  const handleLogout = () => {
    // Clear user data from local storage on logout
    localStorage.removeItem("username");
    navigate('/login');  // Redirect to LoginPage on logout
  };

  const handleRegister= () => {
    navigate('/register');
  };

  return (
    <div>
      {/* Display username if logged in */}
      {username && <h2>Welcome, {username}!</h2>}

      {/* Navigation Buttons */}
      <div>
        <Button label="Register" onClick={handleRegister}/>
        <Button label="Logout" onClick={handleLogout} />
      </div>

      {/* Title and Game Buttons */}
      <h1>Mine Finder</h1>
      <Button label="Play Game" onClick={handlePlayGame} />
      <Button label="Leaderboard" onClick={handleLeaderboard} />
    </div>
  );
}

export default HomePage;
