import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './GamePage.css';

const GRID_SIZE = 6;
const TOTAL_BOMBS = 12; 

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
  const [clickedBombIndex, setClickedBombIndex] = useState(null);
  const [playerStreaks, setPlayerStreaks] = useState([0, 0]);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answerOptions, setAnswerOptions] = useState([]);
  const [extraLifeGiven, setExtraLifeGiven] = useState([false, false]);
  const [username, setUsername] = useState('');
  const [player2Username, setPlayer2Username] = useState('');
  const [showPlayer2Input, setShowPlayer2Input] = useState(true); 
  const [tieMessage, setTieMessage] = useState('');
  const [disarmedBombs, setDisarmedBombs] = useState([]);
  const [gameOverMessage, setGameOverMessage] = useState('');
  const [showQuitConfirmation, setShowQuitConfirmation] = useState(false);
  const navigate = useNavigate(); 

  useEffect(() => {
    initializeBombs();
    fetchQuestions();

    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
    const storedPlayer2Username = localStorage.getItem("player2Username");
    if (storedPlayer2Username) {
      setPlayer2Username(storedPlayer2Username);
    }
  }, []);

  const handlePlayer2Submit = (event) => {
    event.preventDefault();
    const player2Input = event.target.elements.player2Username.value;
    setPlayer2Username(player2Input);
    localStorage.setItem("player2Username", player2Input);
    setShowPlayer2Input(false); 
    event.target.reset(); 
  };

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

  const incorrectAnswersMapping = {
    "What data type is used for numbers with decimals?": ["Integer", "String", "Boolean"],
    "Which symbol is used to assign a value to a variable in Python?": ["==", "!=", "+"],
    "What type of data does a list hold?": ["Single item", "Boolean", "Float"],
    "Which of the following is a valid variable name?": ["2variable", "my-variable", "my variable"],
    "What data type is used for true or false values?": ["Float", "int", "str"],
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
          setPlayerRolls([0, 0]); 
        }, 3000);
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
    if (flippedCells[cellIndex] || gamePhase === 'gameOver') return; 

    flipCell(row, col);
    setPlayerRolls([0, 0]); 
    setGamePhase('initialRoll'); 
  };

  const handleQuit = () => {
    setShowQuitConfirmation(true);
  };

  const confirmQuit = () => {
    navigate('/'); 
  };

  const cancelQuit = () => {
    setShowQuitConfirmation(false); 
  };

  const initializeBombs = () => {
    const bombPositions = new Set();
    while (bombPositions.size < TOTAL_BOMBS) {
      bombPositions.add(Math.floor(Math.random() * GRID_SIZE * GRID_SIZE));
    }
    setBombLocations(Array.from(bombPositions));
  };

  const isBomb = (cellIndex) => bombLocations.includes(cellIndex);

  const handleBombClick = (cellIndex) => {
    setClickedBombIndex(cellIndex);
    const randomIndex = Math.floor(Math.random() * questions.length);
    const selectedQuestion = questions[randomIndex];
    const incorrectAnswers = incorrectAnswersMapping[selectedQuestion.content] || [];
    const allAnswers = [...incorrectAnswers, selectedQuestion.correct_answer];
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

    if (newStreaks[playerIndex] === 3 && !extraLifeGiven[playerIndex]) {
        const newLives = [...playerLives];
        newLives[playerIndex] += 1; 
        setPlayerLives(newLives);

        const newExtraLifeGiven = [...extraLifeGiven];
        newExtraLifeGiven[playerIndex] = true; 
        setExtraLifeGiven(newExtraLifeGiven);

        alert(`Player ${currentPlayer} reached a 3-streak and received 1 extra life!`);
    }

    if (selectedAnswer === currentQuestion.correct_answer) {
        const bombIndex = clickedBombIndex; 
        setDisarmedBombs(prev => [...prev, bombIndex]); 

        const pointsAwarded = newStreaks[playerIndex] >= 5 ? 200 : 100;
        newPoints[playerIndex] += pointsAwarded;
        setPlayerPoints(newPoints);

        alert(`Correct! Bomb disarmed, ${pointsAwarded} points awarded!`);

        newStreaks[playerIndex] += 1;
        if (newStreaks[playerIndex] === 5) {
            alert(`Player ${currentPlayer} reached a 5-streak!`);
        }
        setPlayerStreaks(newStreaks);
    } else {
        alert("Incorrect! You lost a life.");
        const newLives = [...playerLives];
        newLives[playerIndex] = Math.max(0, newLives[playerIndex] - 1); 
        setPlayerLives(newLives);
        newStreaks[playerIndex] = 0; 
        setPlayerStreaks(newStreaks);

        if (newLives[playerIndex] === 0) {
            alert(`Player ${currentPlayer} has no lives left. Game over!`);
            setGamePhase('gameOver');
            return;
        }
    }

    if (disarmedBombs.length + 1 === TOTAL_BOMBS) {
        determineGameOver();
    }

    setCurrentQuestion(null);
    setAnswerOptions([]);
  };

  const determineGameOver = () => {
    const player1Points = playerPoints[0];
    const player2Points = playerPoints[1];
    const player1Lives = playerLives[0];
    const player2Lives = playerLives[1];

    let message = "Game Over! All mines have been disarmed! ";

    console.log(`Player 1: ${username}, Points: ${player1Points}, Lives: ${player1Lives}`);
    console.log(`Player 2: ${player2Username || 'Player 2'}, Points: ${player2Points}, Lives: ${player2Lives}`);

    if (player1Points > player2Points) {
        message += `${username} wins with ${player1Points} points!`;
    } else if (player2Points > player1Points) {
        message += `${player2Username || 'Player 2'} wins with ${player2Points} points!`;
    } else {
        if (player1Lives > player2Lives) {
            message += `${username} wins with ${player1Points} points and ${player1Lives} lives!`;
        } else if (player2Lives > player1Lives) {
            message += `${player2Username || 'Player 2'} wins with ${player2Points } points and ${player2Lives} lives!`;
        } else {
            message += "Both players tied!";
        }
    }
    setGameOverMessage(message);
    setGamePhase('gameOver');
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
        const isDisarmed = disarmedBombs.includes(cellIndex);

        gridCells.push(
          <div
            key={cellIndex}
            className={`grid-cell ${isFlipped ? 'flipped' : ''} ${isBombCell ? 'bomb' : ''} 
            ${isYellowCell ? 'yellow' : ''} ${isClickedBomb ? 'clicked-bomb' : ''}`}
            onClick={() => {
              if (gamePhase === 'pickCell' && !isDisarmed && gamePhase !== 'gameOver') {
                handleCellClick(row, col);
              }
            }}
          >
            {isDisarmed ? '✅' : (isClickedBomb ? '💣' : (isFlipped ? (isBombCell ? '' : '') : ''))}
          </div>
        );
      }
    }
    return gridCells;
  };

  return (
    <div className="game-page"> 
      <div className="centered-container">
        <button className="quit-button" onClick={handleQuit}>Quit</button>
        {showQuitConfirmation && (
          <div className="confirmation-dialog">
            <p>Game data will be gone. Are you sure?</p>
            <button onClick={confirmQuit} className="confirm-button">Yes</button>
            <button onClick={cancelQuit} className="cancel-button">No</button>
          </div>
        )}
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

            {showPlayer2Input && ( 
              <form onSubmit={handlePlayer2Submit} className="player2-username-form">
                <label>Enter Player 2's Username:</label>
                <input type="text" name="player2Username" placeholder="Username" required />
                <button type="submit">Submit</button>
              </form>
            )}

            {gamePhase === 'initialRoll' && (
              <div>
                <h2>{currentPlayer === 1 ? `${ username}, roll your dice!` : `${player2Username || 'Player 2'}, roll your dice!`}</h2>
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
                  disabled={!!currentQuestion || gamePhase === 'gameOver'}
                />
              </div>
            )}

            {currentQuestion && (
              <div className="question-container">
                <h3>{currentQuestion.content}</h3>
                <div className="answer-options">
                  {answerOptions.map((answer, index) => (
                    <button key={index} onClick={() => handleAnswerSubmit(answer)} className="answer-button">
                      {String.fromCharCode(65 + index)}. {answer}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {gamePhase === 'pickCell' && (
              <div>
                <h2>{currentPlayer === 1 ? `${username}, pick a grid cell!` : `${player2Username || 'Player 2'}, pick a grid cell!`}</h2>
              </div>
            )}

            {gamePhase === 'gameOver' && (
              <div className="game-over-message">
                <h2>{gameOverMessage}</h2>
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
            <h2>{player2Username || 'Player 2'}</h2>
            <div>Roll: {playerRolls[1]}</div>
            <div>Points: {playerPoints[1]}</div>
            <div>Lives: {playerLives[1]}</div>
            <div>Streak: {playerStreaks[1]}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GamePage;