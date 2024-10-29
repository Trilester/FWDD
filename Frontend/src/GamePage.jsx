import React, { useState, useEffect } from 'react';
import './GamePage.css';

const GRID_SIZE = 6;

function GamePage() {
  const [flippedCells, setFlippedCells] = useState(Array(GRID_SIZE * GRID_SIZE).fill(false));
  const [highlightedCells, setHighlightedCells] = useState(Array(GRID_SIZE * GRID_SIZE).fill(false));
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [playerRolls, setPlayerRolls] = useState([0, 0]);
  const [gamePhase, setGamePhase] = useState('initialRoll');
  const [bombLocations, setBombLocations] = useState([]);
  const [playerLives, setPlayerLives] = useState([3, 3]);
  const [playerPoints, setPlayerPoints] = useState([0, 0]);

  useEffect(() => {
    initializeBombs(); // Initialize bombs when the game starts
  }, []);

  const handleInitialRoll = (playerIndex, roll) => {
    const newRolls = [...playerRolls];
    newRolls[playerIndex] = roll;
    setPlayerRolls(newRolls);

    if (newRolls[0] && newRolls[1]) {
      const startingPlayer = newRolls[0] >= newRolls[1] ? 1 : 2;
      setCurrentPlayer(startingPlayer);
      setGamePhase('rollAgain');
    } else {
      setCurrentPlayer(playerIndex === 0 ? 2 : 1);
    }
  };

  const resetHighlight = () => {
    setHighlightedCells(Array(GRID_SIZE * GRID_SIZE).fill(false));
  };

  const highlightRowOrColumn = (rowOrColumn, index) => {
    const newHighlight = [...highlightedCells];
    if (rowOrColumn === 'row') {
      for (let col = 0; col < GRID_SIZE; col++) {
        newHighlight[index * GRID_SIZE + col] = true;
      }
    } else {
      for (let row = 0; row < GRID_SIZE; row++) {
        newHighlight[row * GRID_SIZE + index] = true;
      }
    }
    setHighlightedCells(newHighlight);
    setGamePhase('flipCell');
  };

  const initializeBombs = () => {
    const bombPositions = new Set();
    while (bombPositions.size < 18) {
      bombPositions.add(Math.floor(Math.random() * GRID_SIZE * GRID_SIZE));
    }
    setBombLocations(Array.from(bombPositions));
  };

  const isBomb = (cellIndex) => bombLocations.includes(cellIndex);

  const handleBombClick = (cellIndex) => {
    const answer = prompt("Answer this Python question: What is the data type of True? (boolean/integer)");
    const correctAnswer = "boolean";

    if (answer && answer.toLowerCase() === correctAnswer) {
      alert("Correct! Bomb disarmed, points awarded!");
      const newPoints = [...playerPoints];
      newPoints[currentPlayer - 1] += 100;
      setPlayerPoints(newPoints);
    } else {
      alert("Incorrect! You lost a life.");
      const newLives = [...playerLives];
      newLives[currentPlayer - 1] -= 1;
      setPlayerLives(newLives);
      if (newLives[currentPlayer - 1] === 0) {
        alert(`Player ${currentPlayer} has no lives left. Game over!`);
      }
    }
  };

  const flipCell = (row, col) => {
    const cellIndex = row * GRID_SIZE + col;

    if (isBomb(cellIndex)) {
      handleBombClick(cellIndex);
    } else {
      const newFlippedCells = [...flippedCells];
      newFlippedCells[cellIndex] = true;
      setFlippedCells(newFlippedCells);
    }

    setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    resetHighlight();
  };

  const renderGrid = () => {
    const gridCells = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const cellIndex = row * GRID_SIZE + col;
        const isFlipped = flippedCells[cellIndex];
        const isHighlighted = highlightedCells[cellIndex];
        const isBombCell = isBomb(cellIndex);

        gridCells.push(
          <div
            key={cellIndex}
            className={`grid-cell ${isFlipped ? 'flipped' : ''} ${isHighlighted ? 'highlighted' : ''} ${isBombCell ? 'bomb' : ''}`}
            onClick={() => flipCell(row, col)}
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
          <h2>Player 1</h2>
          <div>Roll: {playerRolls[0]}</div>
          <div>Points: {playerPoints[0]}</div>
          <div>Lives: {playerLives[0]}</div>
        </div>

        <div className="game-area">
          <h1>Welcome to the Game Page!</h1>

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
              />
            </div>
          )}

          <div className="grid-container">
            {renderGrid()}
          </div>

        </div>

        <div className="player-info">
          <h2>Player 2</h2>
          <div>Roll: {playerRolls[1]}</div>
          <div>Points: {playerPoints[1]}</div>
          <div>Lives: {playerLives[1]}</div>
        </div>
      </div>
    </div>
  );
}

export default GamePage;
