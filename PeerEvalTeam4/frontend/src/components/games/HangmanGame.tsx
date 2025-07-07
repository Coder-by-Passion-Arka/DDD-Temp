import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Trophy,
} from 'lucide-react';

const wordHints: { [key: string]: string } = {
  code: 'Instructions written to perform tasks',
  bug: 'An error in a program',
  data: 'Information stored or processed',
  loop: 'A programming construct for repetition',
  java: 'A popular object-oriented language',
  html: 'Markup language for web pages',
  node: 'JavaScript runtime built on Chrome’s V8',
  disk: 'Primary data storage hardware',
  byte: 'A group of 8 bits',
  api: 'Interface for software interaction',
  web: 'The network of connected documents',
  ram: 'Volatile memory used for active processes',
  cpu: 'Brain of the computer',
  sql: 'Used to query databases',
  json: 'Lightweight data-interchange format',
  unix: 'Operating system family',
  wifi: 'Wireless internet access technology',
  ping: 'Checks network latency',
  git: 'Version control system',
  port: 'Communication endpoint in networking',
};

const words = Object.keys(wordHints);

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'won':
      return {
        icon: CheckCircle,
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        color: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-800',
        label: 'Won',
      };
    case 'lost':
      return {
        icon: AlertTriangle,
        bg: 'bg-red-100 dark:bg-red-900/20',
        color: 'text-red-600 dark:text-red-400',
        border: 'border-red-200 dark:border-red-800',
        label: 'Lost',
      };
    default:
      return {
        icon: Clock,
        bg: 'bg-blue-100 dark:bg-blue-900/20',
        color: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800',
        label: 'Playing',
      };
  }
};

const HangmanDrawing = ({ wrongGuesses }: { wrongGuesses: number }) => (
  <svg width="120" height="160" className="text-purple-700 dark:text-purple-300">
    <line x1="10" y1="150" x2="110" y2="150" stroke="currentColor" strokeWidth="4" />
    <line x1="30" y1="150" x2="30" y2="10" stroke="currentColor" strokeWidth="4" />
    <line x1="30" y1="10" x2="80" y2="10" stroke="currentColor" strokeWidth="4" />
    <line x1="80" y1="10" x2="80" y2="30" stroke="currentColor" strokeWidth="4" />
    {wrongGuesses > 0 && <circle cx="80" cy="40" r="10" stroke="currentColor" strokeWidth="3" fill="none" />}
    {wrongGuesses > 1 && <line x1="80" y1="50" x2="80" y2="90" stroke="currentColor" strokeWidth="3" />}
    {wrongGuesses > 2 && <line x1="80" y1="60" x2="60" y2="80" stroke="currentColor" strokeWidth="3" />}
    {wrongGuesses > 3 && <line x1="80" y1="60" x2="100" y2="80" stroke="currentColor" strokeWidth="3" />}
    {wrongGuesses > 4 && <line x1="80" y1="90" x2="65" y2="120" stroke="currentColor" strokeWidth="3" />}
    {wrongGuesses > 5 && <line x1="80" y1="90" x2="95" y2="120" stroke="currentColor" strokeWidth="3" />}
  </svg>
);

interface HangmanGameProps {
  onBack: () => void;
  onComplete: (won: boolean, score: number) => void;
}

const HangmanGame: React.FC<HangmanGameProps> = ({ onBack, onComplete }) => {
  const [word, setWord] = useState('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [status, setStatus] = useState('playing');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (status === 'playing' && gameStarted) {
      timer = setInterval(() => setTimeElapsed((t) => t + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [status, gameStarted]);

  useEffect(() => {
    if (status === 'won') {
      const baseScore = 1000;
      const timeBonus = Math.max(0, 300 - timeElapsed);
      const guessPenalty = wrongGuesses * 50;
      const finalScore = baseScore + timeBonus - guessPenalty;
      setScore(finalScore);
      onComplete(true, finalScore);
    } else if (status === 'lost') {
      onComplete(false, 0);
    }
  }, [status]);

  const initializeGame = () => {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    setWord(randomWord);
    setGuesses([]);
    setWrongGuesses(0);
    setStatus('playing');
    setTimeElapsed(0);
    setScore(0);
    setGameStarted(true);
  };

  const handleGuess = (char: string) => {
    if (status !== 'playing' || guesses.includes(char)) return;
    const updatedGuesses = [...guesses, char];
    setGuesses(updatedGuesses);

    if (!word.includes(char)) {
      const newWrong = wrongGuesses + 1;
      setWrongGuesses(newWrong);
      if (newWrong >= 6) setStatus('lost');
    } else if (word.split('').every((l) => updatedGuesses.includes(l))) {
      setStatus('won');
    }
  };

  const displayWord = word
    .split('')
    .map((char) => (guesses.includes(char) ? char : '_'))
    .join(' ');

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;
  const hint = wordHints[word];

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
          onClick={initializeGame}
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
          <p className="text-sm text-purple-600 dark:text-purple-400">Guesses</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 text-center border border-emerald-200 dark:border-emerald-800">
          <Trophy className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
          <p className="text-lg font-bold text-emerald-800 dark:text-emerald-200">{score}</p>
          <p className="text-sm text-emerald-600 dark:text-emerald-400">Score</p>
        </div>
      </div>

      {/* Game Box */}
      <div className="bg-white dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600 mb-6">
        <div className="flex flex-col items-center space-y-4">
          <HangmanDrawing wrongGuesses={wrongGuesses} />
          <p className="text-3xl font-mono tracking-widest text-blue-800 dark:text-blue-200">{displayWord}</p>
          <p className="text-sm text-purple-700 dark:text-purple-300">Wrong guesses: {wrongGuesses}/6</p>
          <div className="text-sm italic text-gray-700 dark:text-gray-300">Hint: {hint}</div>

          {/* Letter buttons */}
          <div className="grid grid-cols-7 gap-2 mt-4">
            {'abcdefghijklmnopqrstuvwxyz'.split('').map((char) => (
              <button
                key={char}
                onClick={() => handleGuess(char)}
                disabled={guesses.includes(char) || status !== 'playing'}
                className="w-8 h-8 text-sm rounded-full font-semibold bg-pink-100 dark:bg-pink-700 hover:bg-pink-300 dark:hover:bg-pink-500 text-gray-900 dark:text-white disabled:opacity-30"
              >
                {char}
              </button>
            ))}
          </div>

          {/* Status */}
          <div
            className={`flex items-center space-x-2 mt-6 px-4 py-2 rounded-xl border ${statusConfig.border} ${statusConfig.bg}`}
          >
            <StatusIcon className={`w-4 h-4 ${statusConfig.color}`} />
            <span className={`text-sm font-medium ${statusConfig.color}`}>{statusConfig.label}</span>
          </div>
        </div>
      </div>

      {/* How to Play */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">🧠 How to Play</h4>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Guess the hidden tech word by clicking letters. You have 6 chances. Use the hint if you're stuck. Score is calculated by speed and fewer wrong guesses.
        </p>
      </div>
    </div>
  );
};

export default HangmanGame;
