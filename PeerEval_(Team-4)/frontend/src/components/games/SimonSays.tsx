import React, { useState, useEffect } from "react";
import { ArrowLeft, RefreshCw, Clock, Target, MousePointerClick } from 'lucide-react';

const colors = ["green", "red", "yellow", "blue"];
const colorMap: Record<string, string> = {
  green: "bg-green-500",
  red: "bg-red-500",
  yellow: "bg-yellow-400",
  blue: "bg-blue-500",
};

interface SimonSaysProps {
  onBack: () => void;
  onComplete: (won: boolean, score: number) => void;
}

const SimonSays: React.FC<SimonSaysProps> = ({ onBack, onComplete }) => {
  const [sequence, setSequence] = useState<string[]>([]);
  const [playerIndex, setPlayerIndex] = useState(0);
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [message, setMessage] = useState("Click start to play!");
  const [level, setLevel] = useState(0);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameStarted) {
      timer = setInterval(() => setTime((prev) => prev + 1), 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [gameStarted]);

  const playSequence = async (seq: string[]) => {
    setIsPlayerTurn(false);
    for (const color of seq) {
      setActiveColor(color);
      await new Promise((res) => setTimeout(res, 500));
      setActiveColor(null);
      await new Promise((res) => setTimeout(res, 200));
    }
    setIsPlayerTurn(true);
    setMessage("Your turn!");
  };

  const startGame = () => {
    const firstColor = colors[Math.floor(Math.random() * colors.length)];
    const newSequence = [firstColor];
    setSequence(newSequence);
    setPlayerIndex(0);
    setLevel(1);
    setMoves(0);
    setTime(0);
    setGameStarted(true);
    setMessage("Watch the sequence");
    playSequence(newSequence);
  };

  const stopGame = () => {
    setGameStarted(false);
    setSequence([]);
    setPlayerIndex(0);
    setLevel(0);
    setMoves(0);
    setTime(0);
    setMessage("Game stopped. Click start to play again.");
  };

  const nextRound = () => {
    const nextColor = colors[Math.floor(Math.random() * colors.length)];
    const newSequence = [...sequence, nextColor];
    setSequence(newSequence);
    setPlayerIndex(0);
    setLevel(level + 1);
    setMessage("Watch the sequence");
    playSequence(newSequence);
  };

  const handlePlayerInput = (color: string) => {
    if (!isPlayerTurn || !gameStarted) return;
    setMoves((prev) => prev + 1);
    if (color === sequence[playerIndex]) {
      if (playerIndex + 1 === sequence.length) {
        setMessage("Good job! Next round...");
        setTimeout(nextRound, 1000);
      } else {
        setPlayerIndex(playerIndex + 1);
      }
    } else {
      setMessage("Wrong color! You lose at Level " + level);
      setGameStarted(false);
      setIsPlayerTurn(false);
      onComplete && onComplete(false, level);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white to-slate-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Games</span>
          </button>

          <button
            onClick={gameStarted ? stopGame : startGame}
            className={`flex items-center space-x-2 px-4 py-1.5 rounded-full ${
              gameStarted
                ? "bg-gradient-to-r from-red-400 to-red-600 hover:from-red-500 hover:to-red-700"
                : "bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600"
            } text-white text-sm font-medium transition`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>{gameStarted ? "Stop" : "Start"}</span>
          </button>
        </div>

        {/* Game Card */}
        <div className="bg-gradient-to-br from-white to-slate-100 dark:from-gray-900 dark:to-gray-800 rounded-2xl p-4 sm:p-6 shadow-xl dark:shadow-gray-900/40 border border-gray-200 dark:border-gray-700 mb-6 text-center">
          <h1 className="text-4xl font-extrabold text-purple-700 dark:text-purple-300 mb-4">🧠 Simon Says</h1>
          <p className="text-xl mb-1">{message}</p>
          {gameStarted && (
            <div className="grid grid-cols-3 gap-4 text-sm text-center text-gray-900 dark:text-white mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-200 dark:border-blue-800">
                <Clock className="w-5 h-5 mx-auto mb-1 text-blue-600 dark:text-blue-400" />
                <div className="font-bold">{time}s</div>
                <div className="text-xs">Time</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 border border-purple-200 dark:border-purple-800">
                <Target className="w-5 h-5 mx-auto mb-1 text-purple-600 dark:text-purple-400" />
                <div className="font-bold">{level}</div>
                <div className="text-xs">Level</div>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-3 border border-yellow-200 dark:border-yellow-800">
                <MousePointerClick className="w-5 h-5 mx-auto mb-1 text-yellow-600 dark:text-yellow-400" />
                <div className="font-bold">{moves}</div>
                <div className="text-xs">Moves</div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-6 place-items-center">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => handlePlayerInput(color)}
                className={`w-32 h-32 rounded-lg shadow-lg border-2 border-white transition-all duration-200 focus:outline-none ${
                  colorMap[color]
                } ${activeColor === color ? "brightness-150 scale-105" : ""}`}
              ></button>
            ))}
          </div>
        </div>

        {/* How to Play / Tips */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800 text-center">
          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            🟩 How to Play
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Repeat the color sequence shown. Each round adds a new color. How long
            can you remember the pattern?
          </p>
        </div>
      </div>
    </div>
  );
};

export default SimonSays;
