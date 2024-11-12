import React, { useEffect, useState } from 'react';
import Button from './Button.jsx';
import { useNavigate } from 'react-router-dom';
import './HomePage.css'; 

function HomePage() {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handlePlayGame = () => {
    navigate('/game'); 
  };

  const handleLogout = () => {
    localStorage.removeItem("username");
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <div className="home-container">
      <div className="header">
        {username && <div className="welcome-message">Welcome, {username}!</div>}
        <Button label="Register" onClick={handleRegister}/>
        <Button label="Logout" onClick={handleLogout} />
      </div>

      <div className="button-container">
        <h1>Mine Finder</h1>
        <Button label="Play Game" onClick={handlePlayGame} />
      </div>
    </div>
  );
}

export default HomePage;