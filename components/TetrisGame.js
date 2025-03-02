import React, { useState, useEffect } from "react";
import styles from "./tetris.module.css";

const TetrisGame = ({ audio }) => {
  const [grid, setGrid] = useState(createEmptyGrid());
  const [piece, setPiece] = useState(createNewPiece());
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [progress, setProgress] = useState(0);
  const [dropSpeed, setDropSpeed] = useState(1000); // Initial drop speed (in ms)

  // Load sound effects
  const clearSound =
    typeof window !== "undefined" ? new Audio("/line-clear.mp3") : null;
  const tetrisSound =
    typeof window !== "undefined" ? new Audio("/4-line-clear.mp3") : null;
  const gameOverSound =
    typeof window !== "undefined" ? new Audio("/game-over.mp3") : null;

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowLeft") {
        movePiece(-1, 0);
      } else if (event.key === "ArrowRight") {
        movePiece(1, 0);
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        movePiece(0, 1);
      } else if (event.key === " ") {
        event.preventDefault();
        rotatePiece();
      }
      // else if (event.key === 'ArrowUp') {
      //   event.preventDefault();
      //   dropPiece();
      // }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [piece]);

  useEffect(() => {
    const gameLoop = setInterval(() => {
      if (piece && !gameOver) {
        movePiece(0, 1);
      }
    }, dropSpeed);
  
    return () => clearInterval(gameLoop);
  }, [piece, gameOver, dropSpeed]);

  useEffect(() => {
    if (gameOver && gameOverSound) {
      gameOverSound.currentTime = 0;
      gameOverSound.play();
    }
  }, [gameOver]);

  const movePiece = (dx, dy) => {
    if (!piece || !piece.position) return;

    const newPiece = {
      ...piece,
      position: { x: piece.position.x + dx, y: piece.position.y + dy },
    };

    if (!isCollision(newPiece)) {
      setPiece(newPiece);
    } else if (dy !== 0) {
      placePieceOnGrid();
      const newPiece = createNewPiece();
      if (isCollision(newPiece)) {
        setGameOver(true);
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
          if (
            newX < 0 ||
            newX >= grid[0].length ||
            newY >= grid.length ||
            (newY >= 0 && grid[newY][newX] !== 0)
          ) {
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
    let rowsToClear = [];

    // Find full rows
    for (let y = 0; y < newGrid.length; y++) {
      if (newGrid[y].every((cell) => cell !== 0)) {
        rowsToClear.push(y);
      }
    }

    if (rowsToClear.length === 0) return; // Avoid unnecessary state updates

    // Flash gradient effect before clearing
    rowsToClear.forEach((row) => {
      newGrid[row] = Array(10)
        .fill()
        .map((_, i) => {
          const blueShade = Math.round((255 / 9) * i);
          return `rgb(${blueShade}, ${blueShade}, 255)`;
        });
    });
    setGrid([...newGrid]);

    setTimeout(() => {
      // Remove the rows after flashing
      rowsToClear.forEach((row) => {
        newGrid.splice(row, 1);
        newGrid.unshift(Array(10).fill(0));
      });

      // **Update the score based on the number of rows cleared**
      const points = [0, 100, 300, 500, 800, 1000, 1200, 1500]; // Scoring table
      setScore((prevScore) => {
        const newScore = prevScore + points[rowsToClear.length];

        const newProgress = (newScore % 1000) / 10; // Normalize progress (0-100%)
        setProgress(newProgress);

        return newScore;
      });

      // Play sound effect
      if (rowsToClear.length === 4) {
        tetrisSound.currentTime = 0;
        tetrisSound.play();
      } else {
        clearSound.currentTime = 0;
        clearSound.play();
      }

      setGrid([...newGrid]);
    }, 300);
  };

  const renderGridWithPiece = () => {
    const tempGrid = grid.map((row) => row.slice());
    const { shape, position, color } = piece;

    shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          const newY = position.y + y;
          const newX = position.x + x;
          if (
            newY >= 0 &&
            newY < tempGrid.length &&
            newX >= 0 &&
            newX < tempGrid[0].length
          ) {
            tempGrid[newY][newX] = color;
          }
        }
      });
    });

    return tempGrid;
  };

  const resetGame = () => {
    setGrid(createEmptyGrid());
    setPiece(createNewPiece());
    setScore(0);
    setGameOver(false);
  };

  const displayGrid = renderGridWithPiece();

  return (
    <div className="tetris-container">
      {gameOver ? (
        <div className="game-over-message">
          Game Over
          <br />
          <button onClick={resetGame} className={styles.customBtn}>
            Restart
          </button>{" "}
        </div>
      ) : (
        <>
          <div className="tetris-game">
            {displayGrid.map((row, rowIndex) => (
              <div key={rowIndex} className="row">
                {row.map((cell, cellIndex) => (
                  <div
                    key={cellIndex}
                    className={`cell ${
                      cell === "white" ? "flash" : cell ? "filled" : ""
                    }`}
                    style={{
                      backgroundColor:
                        cell !== "white" ? cell || "black" : "white",
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </>
      )}
      <div
        key={score} // Forces re-render when score changes
        style={{
          fontSize: "24px",
          fontWeight: "bold",
          marginBottom: "10px",
          animation: "scoreBump 0.3s ease-in-out",
        }}
      >
        Score: {score}
      </div>
      <div
        style={{
          width: "100%",
          height: "10px",
          background: "gray",
          borderRadius: "5px",
          marginBottom: "10px",
        }}
      >
        <div
          style={{
            width: `${(score % 1000) / 10}%`,
            height: "100%",
            background: "limegreen",
            borderRadius: "5px",
            transition: "width 0.3s ease-in-out",
          }}
        ></div>
        <div
          style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "10px" }}
        >
          Level: {level}
        </div>
      </div>
    </div>
  );
};

// Define helper functions to create an empty grid, new piece, and rotate piece
const createEmptyGrid = () => {
  return Array.from({ length: 25 }, () => Array(10).fill(0));
};

const createNewPiece = () => {
  const pieces = [
    {
      shape: [
        [1, 1],
        [1, 1],
      ],
      color: "#E69F00",
      position: { x: 4, y: 0 },
    },
    {
      shape: [
        [0, 1, 0],
        [1, 1, 1],
      ],
      color: "#56B4E9",
      position: { x: 4, y: 0 },
    },
    { shape: [[1, 1, 1, 1]], color: "#009E73", position: { x: 3, y: 0 } },
    {
      shape: [
        [0, 1, 1],
        [1, 1, 0],
      ],
      color: "#F0E442",
      position: { x: 4, y: 0 },
    },
    {
      shape: [
        [1, 1, 0],
        [0, 1, 1],
      ],
      color: "#0072B2",
      position: { x: 4, y: 0 },
    },
    {
      shape: [
        [1, 1],
        [0, 1],
        [0, 1],
      ],
      color: "#D55E00",
      position: { x: 4, y: 0 },
    },
    {
      shape: [
        [1, 1],
        [1, 0],
        [1, 0],
      ],
      color: "#CC79A7",
      position: { x: 4, y: 0 },
    },
    // { shape: [[1, 1, 1, 1, 1, 1, 1]], color: 'rgb(119, 71, 31)', position: { x: 2, y: 0 } },
    // { shape: [[1, 1], [1,0], [1,1], [1,0], [1,0]], color: 'rgb(119, 71, 31)', position: { x: 2, y: 0 } },
    // { shape: [[0,1,0], [1,1,1], [0,1,0]], color: 'rgb(119, 71, 31)', position: { x: 2, y: 0 } },
    // { shape: [[0,1,1], [1,0,0], [1,0,0], [0,1,1]], color: 'rgb(119, 71, 31)', position: { x: 2, y: 0 } },
    // { shape: [[1,1,1,1,1], [1,1,1,1,1], [1,1,1,1,1], [1,1,1,1,1], [1,1,1,1,1]], color: 'rgb(119, 71, 31)', position: { x: 2, y: 0 } },
  ];
  return pieces[Math.floor(Math.random() * pieces.length)];
};

const rotate = (shape) => {
  return shape[0].map((_, index) => shape.map((row) => row[index])).reverse();
};

export default TetrisGame;
