import React, { useState } from "react";
import {
  ArrowLeft,
  Clock,
  Target,
  MousePointerClick,
  RefreshCw,
} from "lucide-react";

interface TicTacToeTSXProps {
  onBack: () => void;
  onComplete: (won: boolean, score: number) => void;
}

const TicTacToeTSX: React.FC<TicTacToeTSXProps> = ({ onBack, onComplete }) => {
  const initialGrid: ("" | "x" | "o")[] = Array(9).fill("");
  const [grid, setGrid] = useState(initialGrid);
  const [, setTurn] = useState<"x" | "o">("x");
  const [isLocked, setIsLocked] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [score, setScore] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning) {
      interval = setInterval(() => setTime((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const resetGame = () => {
    setGrid(initialGrid);
    setTurn("x");
    setIsLocked(false);
    setMessage("");
    setMoves(0);
    setTime(0);
    setScore(0);
    setTimerRunning(false);
    for (let i = 0; i < 9; i++) {
      const cell = document.getElementById(`cell-${i}`);
      if (cell) cell.classList.remove("highlight");
    }
  };

  const highlightWin = (indexes: number[]) => {
    indexes.forEach((i) => {
      const cell = document.getElementById(`cell-${i}`);
      if (cell) cell.classList.add("highlight");
    });
  };

  const checkWin = (newGrid: ("" | "x" | "o")[], isPlayer: boolean) => {
    const winPatterns = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (
        newGrid[a] &&
        newGrid[a] === newGrid[b] &&
        newGrid[b] === newGrid[c]
      ) {
        highlightWin(pattern);
        setIsLocked(true);
        setTimerRunning(false);
        setTimeout(() => {
          const finalScore = isPlayer ? 100 + Math.max(0, 30 - time) : 0;
          setMessage(isPlayer ? "You win!" : "You lose!");
          setScore(finalScore);
          onComplete && onComplete(isPlayer, finalScore);
        }, 200);
        return true;
      }
    }

    if (newGrid.every((cell) => cell !== "")) {
      setIsLocked(true);
      setTimerRunning(false);
      setTimeout(() => {
        setMessage("It's a draw!");
        setScore(0);
        onComplete && onComplete(false, 0);
      }, 200);
      return true;
    }

    return false;
  };

  const computerMove = (updatedGrid: ("" | "x" | "o")[]) => {
    if (isLocked) return;
    const emptyIndexes = updatedGrid
      .map((v, i) => (v === "" ? i : null))
      .filter((i) => i !== null) as number[];
    if (emptyIndexes.length === 0) return;
    const randomIndex =
      emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];
    updatedGrid[randomIndex] = "o";
    setGrid(updatedGrid);
    checkWin(updatedGrid, false);
  };

  const handleClick = (idx: number) => {
    if (isLocked || grid[idx] !== "") return;
    const newGrid = [...grid];
    newGrid[idx] = "x";
    setGrid(newGrid);
    setMoves((m) => m + 1);
    if (moves === 0) setTimerRunning(true);
    const playerWon = checkWin(newGrid, true);
    if (!playerWon) {
      setTimeout(() => computerMove([...newGrid]), 500);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white to-slate-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Games</span>
          </button>
          <button
            onClick={resetGame}
            className="flex items-center space-x-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white text-sm font-medium transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Restart</span>
          </button>
        </div>

        {/* Scoreboard */}
        <div className="grid grid-cols-3 gap-4 mb-6 text-sm text-center">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-200 dark:border-blue-800">
            <Clock className="w-5 h-5 mx-auto mb-1 text-blue-600 dark:text-blue-400" />
            <div className="font-bold">{time}s</div>
            <div className="text-xs">Time</div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-3 border border-yellow-200 dark:border-yellow-800">
            <MousePointerClick className="w-5 h-5 mx-auto mb-1 text-yellow-600 dark:text-yellow-400" />
            <div className="font-bold">{moves}</div>
            <div className="text-xs">Moves</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 border border-purple-200 dark:border-purple-800">
            <Target className="w-5 h-5 mx-auto mb-1 text-purple-600 dark:text-purple-400" />
            <div className="font-bold">{score}</div>
            <div className="text-xs">Score</div>
          </div>
        </div>

        {/* Game Card */}
        <div className="bg-gradient-to-br from-white via-indigo-100 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-2xl p-4 sm:p-6 shadow-xl dark:shadow-gray-900/40 border border-gray-200 dark:border-gray-700 mb-6">
          <h1 className="text-4xl font-bold mb-6 text-purple-700 dark:text-purple-300 text-center">
            Tic Tac Toe
          </h1>
          {/* Responsive grid wrapper */}
          <div className="w-full flex justify-center">
            <div
              className="
                grid grid-cols-3 gap-2 sm:gap-4
                w-full max-w-xs sm:max-w-sm md:max-w-md
              "
            >
              {grid.map((value, idx) => (
                <div
                  key={idx}
                  id={`cell-${idx}`}
                  className="
                    aspect-square flex-1
                    bg-blue-700 hover:bg-blue-600 text-white
                    text-3xl sm:text-5xl md:text-6xl
                    flex items-center justify-center rounded-lg cursor-pointer shadow-md
                    transition-all duration-300 ease-in-out transform hover:scale-105
                  "
                  onClick={() => handleClick(idx)}
                >
                  {value === "x" && "✖"}
                  {value === "o" && "◯"}
                </div>
              ))}
            </div>
          </div>
          {message && (
            <div className="mt-6 text-2xl font-semibold text-amber-300 text-center animate-pulse">
              {message}
            </div>
          )}
        </div>

        {/* How to Play / Tips */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            ✖ How to Play
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Play against the computer. Click a cell to place your X. First to
            get 3 in a row wins. Try to beat the AI!
          </p>
        </div>
      </div>
    </div>
  );
};

export default TicTacToeTSX;
