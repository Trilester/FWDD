import React, { useState, useEffect } from 'react';
import './GamePage.css';

const GRID_SIZE = 6;

function GamePage() { 
  const [flippedCells, setFlippedCells] = useState(Array(GRID_SIZE * GRID_SIZE).fill(false));
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [playerRolls, setPlayerRolls] = useState([0, 0]);
  const [gamePhase, setGamePhase] = useState('initialRoll');
  const [bombLocations, setBombLocations] = useState([]);
  const [playerLives, setPlayerLives] = useState([3, 3]);
  const [playerPoints, setPlayerPoints] = useState([0, 0]);
  const [yellowCells, setYellowCells] = useState(Array(GRID_SIZE * GRID_SIZE).fill(false));
  const [clickedBombs, setClickedBombs] = useState(Array(GRID_SIZE * GRID_SIZE).fill(false));
  const [playerStreaks, setPlayerStreaks] = useState([0, 0]);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answerOptions, setAnswerOptions] = useState([]);
  const [extraLifeGiven, setExtraLifeGiven] = useState([false, false]);
  const [streakBonus, setStreakBonus] = useState([false, false]);
  const [username, setUsername] = useState('');
  const [isPlayer2NameSet, setIsPlayer2NameSet] = useState(false);
  const [tieMessage, setTieMessage] = useState('');
  
  useEffect(() => {
    initializeBombs();
    fetchQuestions();
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch('http://localhost:8081/questions');
      if (!response.ok) throw new Error('Failed to fetch questions');
      const data = await response.json();
      setQuestions(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleInitialRoll = (playerIndex, roll) => {
    const newRolls = [...playerRolls];
    newRolls[playerIndex] = roll;
    setPlayerRolls(newRolls);

    if (newRolls[0] && newRolls[1]) {
      if (newRolls[0] === newRolls[1]) {
        setTieMessage("Both players rolled the same! Both players have to roll again!");
        setTimeout(() => {
          setTieMessage('');
          setPlayerRolls([0, 0]); // Reset rolls for a new attempt
        }, 3000); // Display message for 2 seconds
      } else {
        determineStartingPlayer(newRolls);
      }
    } else {
      setCurrentPlayer(playerIndex === 0 ? 2 : 1);
    }
  };

  const determineStartingPlayer = (rolls) => {
    const startingPlayer = rolls[0] >= rolls[1] ? 1 : 2;
    setCurrentPlayer(startingPlayer);
    setGamePhase('pickCell');
  };

  const handleCellClick = (row, col) => {
    const cellIndex = row * GRID_SIZE + col;
    if (flippedCells[cellIndex]) return;
    flipCell(row, col);
    setPlayerRolls([0, 0]);
    setGamePhase('initialRoll');
  };

  const initializeBombs = () => {
    const bombPositions = new Set();
    while (bombPositions.size < 15) {
      bombPositions.add(Math.floor(Math.random() * GRID_SIZE * GRID_SIZE));
    }
    setBombLocations(Array.from(bombPositions));
  };

  const isBomb = (cellIndex) => bombLocations.includes(cellIndex);

  const handleBombClick = (cellIndex) => {
    const randomIndex = Math.floor(Math.random() * questions.length);
    const selectedQuestion = questions[randomIndex];

    // Generate answer options including the correct answer
    const incorrectAnswers = questions
      .filter(q => q.correct_answer !== selectedQuestion.correct_answer)
      .map(q => q.correct_answer)
      .sort(() => 0.5 - Math.random()) // Shuffle to randomize
      .slice(0, 3); // Get 3 incorrect answers

    const allAnswers = [...incorrectAnswers, selectedQuestion.correct_answer];
    // Shuffle the answer options
    setAnswerOptions(allAnswers.sort(() => 0.5 - Math.random()));
    setCurrentQuestion(selectedQuestion);

    setClickedBombs(prev => {
      const newClickedBombs = [...prev];
      newClickedBombs[cellIndex] = true;
      return newClickedBombs;
    });
  };

  const flipCell = (row, col) => {
    const cellIndex = row * GRID_SIZE + col;

    if (isBomb(cellIndex)) {
      handleBombClick(cellIndex);
    } else {
      const newFlippedCells = [...flippedCells];
      newFlippedCells[cellIndex] = true;
      setFlippedCells(newFlippedCells);
      setYellowCells(prev => {
        const newYellowCells = [...prev];
        newYellowCells[cellIndex] = true;
        return newYellowCells;
      });
    }
  };

const handleAnswerSubmit = (selectedAnswer) => {
  const newPoints = [...playerPoints];
  const newStreaks = [...playerStreaks];
  const playerIndex = currentPlayer - 1;

  if (selectedAnswer === currentQuestion.correct_answer) {
    // Calculate points based on current streak
    const pointsAwarded = newStreaks[playerIndex] >= 5 ? 200 : 100;

    // Update points for the current player
    newPoints[playerIndex] += pointsAwarded;
    setPlayerPoints(newPoints);

    alert(`Correct! Bomb disarmed, ${pointsAwarded} points awarded!`);

    // Increment the current player's streak
    newStreaks[playerIndex] += 1;

    // Check if the player has reached a 5-streak
    if (newStreaks[playerIndex] === 5) {
      alert(`Player ${currentPlayer} reached a 5-streak!`);
    }

    setPlayerStreaks(newStreaks);

    // Check for streak of 3 to award an extra life if not already given
    if (newStreaks[playerIndex] === 3 && !extraLifeGiven[playerIndex]) {
      const newLives = [...playerLives];
      newLives[playerIndex] += 1; // Award 1 extra life
      setPlayerLives(newLives);

      const newExtraLifeGiven = [...extraLifeGiven];
      newExtraLifeGiven[playerIndex] = true; // Mark extra life as given for this player
      setExtraLifeGiven(newExtraLifeGiven);

      alert(`Player ${currentPlayer} reached a 3-streak and received 1 extra life!`);
    }

  } else {
    alert("Incorrect! You lost a life.");
    const newLives = [...playerLives];
    newLives[playerIndex] -= 1;
    setPlayerLives(newLives);

    // Reset the player's streak if they answered incorrectly
    if (newStreaks[playerIndex] > 0) {
      newStreaks[playerIndex] = 0; // Reset streak on incorrect answer
    }
    setPlayerStreaks(newStreaks);

    // Deduct points for incorrect answer but ensure score does not go below zero
    newPoints[playerIndex] = Math.max(0, newPoints[playerIndex] - 100); // Ensure score does not go negative
    setPlayerPoints(newPoints);

    if (newLives[playerIndex] === 0) {
      alert(`Player ${currentPlayer} has no lives left. Game over!`);
      setGamePhase('gameOver');
      return;
    }
  }

  // Clear the question after answering
  setCurrentQuestion(null);
  setAnswerOptions([]);
};  

  const renderGrid = () => {
    const gridCells = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const cellIndex = row * GRID_SIZE + col;
        const isFlipped = flippedCells[cellIndex];
        const isBombCell = isBomb(cellIndex);
        const isYellowCell = yellowCells[cellIndex];
        const isClickedBomb = clickedBombs[cellIndex];
  
        gridCells.push(
          <div
            key={cellIndex}
            className={`grid-cell ${isFlipped ? 'flipped' : ''} ${isBombCell ? 'bomb' : ''} ${isYellowCell ? 'yellow' : ''} ${isClickedBomb ? 'clicked-bomb' : ''}`}
            onClick={() => {
              if (gamePhase === 'pickCell') handleCellClick(row, col);
            }}
          >
            {isFlipped ? (isBombCell ? '💣' : '') : ''}
          </div>
        );
      }
    }
    return gridCells;
  };
  
  return (
  <div className="centered-container">
    <div className="game-container">
      <div className="player-info">
        <h2>{username}</h2>
        <div>Roll: {playerRolls[0]}</div>
        <div>Points: {playerPoints[0]}</div>
        <div>Lives: {playerLives[0]}</div>
        <div>Streak: {playerStreaks[0]}</div>
      </div>

      <div className="game-area">
        <h1>Mine Finder</h1>

        {gamePhase === 'initialRoll' && (
          <div>
            <h2>Player {currentPlayer}, roll your dice!</h2>
            <input
              type="number"
              min="1"
              max="6"
              placeholder="Enter your roll (1-6)"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const roll = parseInt(e.target.value);
                  if (roll >= 1 && roll <= 6) {
                    handleInitialRoll(currentPlayer - 1, roll);
                    e.target.value = '';
                  }
                }
              }}
              disabled={!!currentQuestion} // Disable input if a question is active
            />
          </div>
        )}

        {currentQuestion && (
          <div className="question-container">
            <h3>{currentQuestion.content}</h3>
            <div className="answer-options">
              {answerOptions.map((answer, index) => (
                <button key={index} onClick={() => handleAnswerSubmit(answer)} className="answer-button">
                  {String.fromCharCode(65 + index)}. {answer} {/* A, B, C, D */}
                </button>
              ))}
            </div>
          </div>
        )}

        {gamePhase === 'pickCell' && (
          <div>
            <h2>Player {currentPlayer}, pick a grid cell!</h2>
          </div>
        )}

        <div className="grid-container">
          {renderGrid()}
        </div>

        {tieMessage && (
          <div className="message-container">
            <p>{tieMessage}</p>
          </div>
        )}
      </div>

      <div className="player-info">
        <h2>Player 2</h2>
        <div>Roll: {playerRolls[1]}</div>
        <div>Points: {playerPoints[1]}</div>
        <div>Lives: {playerLives[1]}</div>
        <div>Streak: {playerStreaks[1]}</div>
      </div>
    </div>
  </div>
  );
}

export default GamePage;
