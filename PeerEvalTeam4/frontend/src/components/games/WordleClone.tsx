import React, { useState, useEffect } from "react";
import { ArrowLeft, RefreshCw, Clock, Target, Trophy } from "lucide-react";

const WORD_LIST = ["react", "train", "flame", "brush", "ghost", "plant", "glide", "jumps"];
const MAX_ATTEMPTS = 6;

const getRandomWord = () => WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];

interface WordleCloneProps {
  onBack: () => void;
  onComplete: (won: boolean, score: number) => void;
}

const WordleClone: React.FC<WordleCloneProps> = ({ onBack, onComplete }) => {
  const [targetWord, setTargetWord] = useState<string>(getRandomWord());
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>("");
  const [message, setMessage] = useState<string>("");
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
    if (currentGuess.length !== 5 || gameOver) return;

    const guess = currentGuess.toLowerCase();
    const updatedGuesses = [...guesses, guess];
    setGuesses(updatedGuesses);

    if (guess === targetWord) {
      const baseScore = 1000;
      const timePenalty = timeElapsed * 2;
      const attemptPenalty = updatedGuesses.length * 20;
      const finalScore = Math.max(0, baseScore - timePenalty - attemptPenalty);
      setMessage("🎉 You guessed the word!");
      setGameOver(true);
      setScore(finalScore);
      onComplete(true, finalScore);
    } else if (updatedGuesses.length === MAX_ATTEMPTS) {
      setMessage(`You lose! The word was "${targetWord}".`);
      setGameOver(true);
      onComplete(false, 0);
    }

    setCurrentGuess("");
  };

  const resetGame = () => {
    setTargetWord(getRandomWord());
    setGuesses([]);
    setCurrentGuess("");
    setMessage("");
    setGameOver(false);
    setTimeElapsed(0);
    setScore(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getLetterColor = (letter: string, index: number) => {
    if (letter === targetWord[index]) return "bg-green-500";
    if (targetWord.includes(letter)) return "bg-yellow-400";
    return "bg-gray-600";
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Games</span>
        </button>
        <button
          onClick={resetGame}
          className="flex items-center space-x-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
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
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Wordle Clone</h1>

        <div className="grid gap-2 mb-6">
          {Array.from({ length: MAX_ATTEMPTS }).map((_, rowIndex) => (
            <div className="flex gap-2 justify-center" key={rowIndex}>
              {Array.from({ length: 5 }).map((_, colIndex) => {
                const guess = guesses[rowIndex] || "";
                const letter = guess[colIndex] || "";
                const color = guess ? getLetterColor(letter, colIndex) : "bg-slate-700";
                return (
                  <div
                    key={colIndex}
                    className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-md font-bold text-xl uppercase text-white ${color}`}
                  >
                    {letter}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {!gameOver && (
          <div className="mb-6 text-center">
            <input
              type="text"
              value={currentGuess}
              onChange={(e) => setCurrentGuess(e.target.value.slice(0, 5))}
              className="w-48 p-2 text-black rounded-lg text-center shadow-inner mb-2"
              placeholder="Enter 5-letter word"
            />
            <button
              onClick={handleGuess}
              className="ml-4 px-6 py-2 bg-blue-700 hover:bg-blue-600 rounded-full text-white text-lg shadow-md transition"
            >
              Submit
            </button>
          </div>
        )}

        {message && <p className="text-xl font-semibold text-amber-300 text-center mb-4 animate-pulse">{message}</p>}
      </div>

      {/* How to Play */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
          📝 How to Play
        </h4>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Guess the 5-letter word in 6 tries. Letters in the correct spot are <span className="text-green-600 font-semibold">green</span>, letters in the word but wrong spot are <span className="text-yellow-500 font-semibold">yellow</span>, others are <span className="text-gray-600 font-semibold">gray</span>.
        </p>
      </div>
    </div>
  );
};

export default WordleClone;
