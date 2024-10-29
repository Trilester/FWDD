import React, { useState } from 'react';
import './GamePage.css';

const GRID_SIZE = 6;

function GamePage() {
  const [flippedCells, setFlippedCells] = useState(Array(GRID_SIZE * GRID_SIZE).fill(false));
  const [highlightedCells, setHighlightedCells] = useState(Array(GRID_SIZE * GRID_SIZE).fill(false));
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [playerRolls, setPlayerRolls] = useState([0, 0]);
  const [gamePhase, setGamePhase] = useState('initialRoll'); // initialRoll, rollAgain, selectRowOrColumn, flipCell
  const [selectedRowOrColumn, setSelectedRowOrColumn] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);

  // Handles the initial dice roll to determine who goes first
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

  // Resets highlighted cells after selection
  const resetHighlight = () => {
    setHighlightedCells(Array(GRID_SIZE * GRID_SIZE).fill(false));
  };

  // Highlights row or column based on selection
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

  // Flips a specific cell based on the row and column selected
  const flipCell = (row, col) => {
    const cellIndex = row * GRID_SIZE + col;
    const newFlippedCells = [...flippedCells];
    newFlippedCells[cellIndex] = true;
    setFlippedCells(newFlippedCells);

    setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    setGamePhase('rollAgain');
    resetHighlight();
  };

  return (
    <div className="centered-container">
      <div className="game-container">
        <div className="player-info">
          <h2>Player 1</h2>
          <div id="player1Box">Roll: {playerRolls[0]}</div>
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

          {gamePhase === 'rollAgain' && (
            <div>
              <h2>Player {currentPlayer}, roll again to select row or column!</h2>
              <input
                type="number"
                min="1"
                max="6"
                placeholder="Enter your roll (1-6)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const roll = parseInt(e.target.value);
                    if (roll >= 1 && roll <= 6) {
                      setSelectedIndex(roll - 1); // Store row or column index (0-based)
                      setGamePhase('selectRowOrColumn');
                      e.target.value = '';
                    }
                  }
                }}
              />
            </div>
          )}

          {gamePhase === 'selectRowOrColumn' && (
            <div>
              <h2>Player {currentPlayer}, choose Row or Column based on roll!</h2>
              <button onClick={() => {
                setSelectedRowOrColumn('row');
                highlightRowOrColumn('row', selectedIndex);
              }}>Row</button>
              <button onClick={() => {
                setSelectedRowOrColumn('column');
                highlightRowOrColumn('column', selectedIndex);
              }}>Column</button>
            </div>
          )}

          {gamePhase === 'flipCell' && (
            <div>
              <h2>Player {currentPlayer}, roll again to select cell in chosen row/column!</h2>
              <input
                type="number"
                min="1"
                max="6"
                placeholder="Enter your roll (1-6)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const roll = parseInt(e.target.value);
                    if (roll >= 1 && roll <= 6) {
                      if (selectedRowOrColumn === 'row') {
                        flipCell(selectedIndex, roll - 1);
                      } else {
                        flipCell(roll - 1, selectedIndex);
                      }
                      e.target.value = '';
                    }
                  }
                }}
              />
            </div>
          )}

          <div className="grid-container">
            <div className="grid">
              <div className="empty-cell"></div>
              {[...Array(GRID_SIZE)].map((_, i) => (
                <div key={`col-${i}`} className="label-cell">
                  {i + 1}
                </div>
              ))}

              {[...Array(GRID_SIZE)].map((_, rowIndex) => (
                <React.Fragment key={rowIndex}>
                  <div className="label-cell">{rowIndex + 1}</div>
                  {[...Array(GRID_SIZE)].map((_, colIndex) => {
                    const cellIndex = rowIndex * GRID_SIZE + colIndex;
                    return (
                      <div
                        key={cellIndex}
                        className={`cell ${flippedCells[cellIndex] ? 'flipped' : ''} ${highlightedCells[cellIndex] ? 'highlighted' : ''}`}
                      >
                        {flippedCells[cellIndex] ? 'Flipped' : ''}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <div className="player-info">
          <h2>Player 2</h2>
          <div id="player2Box">Roll: {playerRolls[1]}</div>
        </div>
      </div>
    </div>
  );
}

export default GamePage;
