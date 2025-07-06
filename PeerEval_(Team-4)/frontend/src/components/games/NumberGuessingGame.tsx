import React, { useState, useEffect } from "react";
import { ArrowLeft, RefreshCw, Clock, Target, Trophy } from "lucide-react";

interface NumberGuessingGameProps {
  onBack: () => void;
  onComplete: (won: boolean, score: number) => void;
}

const NumberGuessingGame: React.FC<NumberGuessingGameProps> = ({
  onBack,
  onComplete,
}) => {
  const [secretNumber, setSecretNumber] = useState<number>(Math.floor(Math.random() * 100) + 1);
  const [guess, setGuess] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [guesses, setGuesses] = useState<number[]>([]);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [score, setScore] = useState<number>(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!gameOver) {
      timer = setInterval(() => setTimeElapsed((prev) => prev + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [gameOver]);

  const handleGuess = () => {
    const numericGuess = parseInt(guess);
    if (isNaN(numericGuess) || numericGuess < 1 || numericGuess > 100) {
      setMessage("Please enter a valid number between 1 and 100.");
      return;
    }

    const updatedGuesses = [...guesses, numericGuess];
    setGuesses(updatedGuesses);

    if (numericGuess === secretNumber) {
      const baseScore = 1000;
      const timeBonus = Math.max(0, 300 - timeElapsed);
      const guessPenalty = updatedGuesses.length * 10;
      const finalScore = baseScore + timeBonus - guessPenalty;
      setMessage("🎉 You guessed it right!");
      setGameOver(true);
      setScore(finalScore);
      onComplete(true, finalScore);
    } else if (numericGuess < secretNumber) {
      setMessage("Too low. Try again.");
    } else {
      setMessage("Too high. Try again.");
    }

    setGuess("");
  };

  const handleReset = () => {
    setSecretNumber(Math.floor(Math.random() * 100) + 1);
    setGuess("");
    setMessage("");
    setGuesses([]);
    setGameOver(false);
    setTimeElapsed(0);
    setScore(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-2xl mx-auto">
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
          onClick={handleReset}
          className="flex items-center space-x-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reset</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center border border-blue-200 dark:border-blue-800">
          <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
          <p className="text-lg font-bold text-blue-800 dark:text-blue-200">{formatTime(timeElapsed)}</p>
          <p className="text-sm text-blue-600 dark:text-blue-400">Time</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center border border-purple-200 dark:border-purple-800">
          <Target className="w-6 h-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
          <p className="text-lg font-bold text-purple-800 dark:text-purple-200">{guesses.length}</p>
          <p className="text-sm text-purple-600 dark:text-purple-400">Attempts</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 text-center border border-emerald-200 dark:border-emerald-800">
          <Trophy className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
          <p className="text-lg font-bold text-emerald-800 dark:text-emerald-200">{score}</p>
          <p className="text-sm text-emerald-600 dark:text-emerald-400">Score</p>
        </div>
      </div>

      {/* Game Card */}
      <div className="bg-gradient-to-br from-white via-indigo-100 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700 mb-6">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Number Guessing Game</h1>
        <p className="mb-4 text-lg text-gray-700 dark:text-gray-300">Guess the number between 1 and 100</p>

        <input
          type="number"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          className="w-48 p-2 mb-4 text-black rounded-lg text-center shadow-inner"
          disabled={gameOver}
        />
        <button
          onClick={handleGuess}
          disabled={gameOver}
          className="mb-4 px-6 py-2 bg-blue-700 hover:bg-blue-600 rounded-full text-white text-lg shadow-md transition-all"
        >
          Guess
        </button>

        {message && <p className="text-xl font-medium mb-4 text-yellow-500">{message}</p>}

        {guesses.length > 0 && (
          <div className="mb-6">
            <p className="mb-2 text-gray-700 dark:text-gray-300">Your guesses:</p>
            <div className="flex flex-wrap gap-2">
              {guesses.map((g, idx) => (
                <span key={idx} className="px-3 py-1 bg-blue-600 rounded-full shadow text-white">
                  {g}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* How to Play */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
          🔢 How to Play
        </h4>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Guess the secret number between 1 and 100. You'll get feedback whether your guess is too high or too low. Try to guess in as few attempts and as quickly as possible!
        </p>
      </div>
    </div>
  );
};

export default NumberGuessingGame;
