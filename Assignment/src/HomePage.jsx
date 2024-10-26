import React from 'react';
import Button from './Button.jsx';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();

  const handlePlayGame = () => {
    navigate('/game');
  };

  const handleLeaderboard = () => {
    navigate('/leaderboard');
  };

  const handleLogout = () => {
    // You can also add logic to clear user data (like clearing localStorage or cookies) here
    navigate('/login');  // Redirect to LoginPage on logout
  };

  const handleRegister= () => {
    navigate('/register');
  };

  return (
    <div>
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
