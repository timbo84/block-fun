import React, { useState, useEffect } from 'react';

const TetrisGame = () => {
  const [grid, setGrid] = useState(createEmptyGrid());
  const [piece, setPiece] = useState(createNewPiece());
  const [gameOver, setGameOver] = useState(false);

  // Load game over sound
  const gameOverSound = typeof window !== 'undefined' ? new Audio('/game-over.mp3') : null;

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft') {
        movePiece(-1, 0);
      } else if (event.key === 'ArrowRight') {
        movePiece(1, 0);
      } else if (event.key === 'ArrowDown') {
        movePiece(0, 1);
      } else if (event.key === ' ') {
        event.preventDefault(); // Prevent default behavior of spacebar
        rotatePiece();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [piece]);

  useEffect(() => {
    const gameLoop = setInterval(() => {
      if (piece && !gameOver) {
        movePiece(0, 1); // Move piece down every interval
      }
    }, 1000);

    return () => clearInterval(gameLoop);
  }, [piece, gameOver]);

  // Play game over sound when game over state is set
  useEffect(() => {
    if (gameOver && gameOverSound) {
      gameOverSound.currentTime = 0; // Reset sound
      gameOverSound.play();
    }
  }, [gameOver]);

  const movePiece = (dx, dy) => {
    if (!piece || !piece.position) return;

    const newPiece = { ...piece, position: { x: piece.position.x + dx, y: piece.position.y + dy } };

    if (!isCollision(newPiece)) {
      setPiece(newPiece);
    } else if (dy !== 0) {
      placePieceOnGrid();
      const newPiece = createNewPiece();
      if (isCollision(newPiece)) {
        setGameOver(true); // Triggers game over sound
      } else {
        setPiece(newPiece);
      }
    }
  };

  const rotatePiece = () => {
    if (!piece || !piece.shape) return;

    const newShape = rotate(piece.shape);
    const newPiece = { ...piece, shape: newShape };

    if (!isCollision(newPiece)) {
      setPiece(newPiece);
    }
  };

  const isCollision = (newPiece) => {
    const { shape, position } = newPiece;
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] !== 0) {
          const newX = position.x + x;
          const newY = position.y + y;
          if (newX < 0 || newX >= grid[0].length || newY >= grid.length || (newY >= 0 && grid[newY][newX] !== 0)) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const placePieceOnGrid = () => {
    const { shape, position, color } = piece;
    const newGrid = [...grid];
    shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          newGrid[position.y + y][position.x + x] = color;
        }
      });
    });
    clearCompleteRows(newGrid);
    setGrid(newGrid);
  };

  const clearCompleteRows = (newGrid) => {
    let clearedRows = 0;

    for (let y = newGrid.length - 1; y >= 0; y--) {
      if (newGrid[y].every(cell => cell !== 0)) {
        clearedRows++;
        for (let row = y; row > 0; row--) {
          newGrid[row] = [...newGrid[row - 1]];
        }
        newGrid[0] = Array(10).fill(0);
        y++; // Recheck this row after shifting
      }
    }
    console.log('Rows cleared:', clearedRows);
  };

  const renderGridWithPiece = () => {
    const tempGrid = grid.map((row) => row.slice());
    const { shape, position, color } = piece;

    shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          const newY = position.y + y;
          const newX = position.x + x;
          if (newY >= 0 && newY < tempGrid.length && newX >= 0 && newX < tempGrid[0].length) {
            tempGrid[newY][newX] = color;
          }
        }
      });
    });

    return tempGrid;
  };

  const displayGrid = renderGridWithPiece();

  return (
    <div className="tetris-container">
      {gameOver ? (
        <div className="game-over-message">Game Over</div>
      ) : (
        <div className="tetris-game">
          {displayGrid.map((row, rowIndex) => (
            <div key={rowIndex} className="row">
              {row.map((cell, cellIndex) => (
                <div
                  key={cellIndex}
                  className={`cell ${cell ? 'filled' : ''}`}
                  style={{ backgroundColor: cell || 'black' }}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Define helper functions to create an empty grid, new piece, and rotate piece
const createEmptyGrid = () => {
  return Array.from({ length: 20 }, () => Array(10).fill(0));
};

const createNewPiece = () => {
  const pieces = [
    { shape: [[1, 1], [1, 1]], color: '#E69F00', position: { x: 4, y: 0 } },
    { shape: [[0, 1, 0], [1, 1, 1]], color: '#56B4E9', position: { x: 4, y: 0 } },
    { shape: [[1, 1, 1, 1]], color: '#009E73', position: { x: 3, y: 0 } },
    { shape: [[0, 1, 1], [1, 1, 0]], color: '#F0E442', position: { x: 4, y: 0 } },
    { shape: [[1, 1, 0], [0, 1, 1]], color: '#0072B2', position: { x: 4, y: 0 } },
    { shape: [[1, 1], [0,1], [0,1]], color: '#D55E00', position: { x: 4, y: 0 } },
    { shape: [[1, 1], [1,0], [1,0]], color: '#CC79A7', position: { x: 4, y: 0 } },
     // { shape: [[1, 1, 1, 1, 1, 1, 1]], color: 'brown', position: { x: 2, y: 0 } },
    // { shape: [[1, 1], [1,0], [1,1], [1,0], [1,0]], color: 'brown', position: { x: 2, y: 0 } },
    // { shape: [[0,1,0], [1,1,1], [0,1,0]], color: 'brown', position: { x: 2, y: 0 } },
    // { shape: [[0,1,1], [1,0,0], [1,0,0], [0,1,1]], color: 'brown', position: { x: 2, y: 0 } },
    // { shape: [[1,1,1,1,1], [1,1,1,1,1], [1,1,1,1,1], [1,1,1,1,1], [1,1,1,1,1]], color: 'brown', position: { x: 2, y: 0 } },
  ];
  return pieces[Math.floor(Math.random() * pieces.length)];
};

const rotate = (shape) => {
  return shape[0].map((_, index) => shape.map(row => row[index])).reverse();
};

export default TetrisGame;
