import React, { useState } from "react";
import { X, Gamepad2, Trophy, Star, Clock, Target } from "lucide-react";

import HangmanGame from "./games/HangmanGame.tsx";
import MemoryMatch from "./games/MemoryMatch.tsx";
import Minesweeper from "./games/Minesweeper.tsx";
import NumberGuessingGame from "./games/NumberGuessingGame.tsx";
import RockPaperScissors from "./games/RockPaperScissors.tsx";
import SimonSays from "./games/SimonSays.tsx";
import SlidingPuzzle from "./games/SlidingPuzzle.tsx";
import SnakeGame from "./games/SnakeGame.tsx";
import MazeEscape from "./games/MazeEscape.tsx";
import SortingGame from "./games/SortingGame.tsx";
import TicTacToe from "./games/TicTacToe.tsx";
import WordleClone from "./games/WordleClone.tsx";

interface GameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type GameType =
  | "menu"
  // | 'treasure'
  | "rps"
  | "memory"
  | "minesweeper"
  | "sliding"
  | "hangman"
  | "numberguess"
  | "wordle"
  | "snake"
  | "maze"
  | "simon"
  | "tictactoe"
  | "sorting";

const GameModal: React.FC<GameModalProps> = ({ isOpen, onClose }) => {
  const [currentGame, setCurrentGame] = useState<GameType>("menu");
  const [gameStats, setGameStats] = useState({
    gamesPlayed: 47,
    gamesWon: 32,
    totalScore: 2450,
    bestStreak: 8,
  });

  const games = [
    // {
    //   id: 'treasure' as GameType,
    //   name: 'Treasure Hunt',
    //   description: 'Follow clues to find hidden treasures',
    //   icon: '🗺️',
    //   difficulty: 'Medium',
    //   color: 'from-amber-500 to-orange-600',
    //   estimatedTime: '5-10 min',
    // },
    {
      id: "rps" as GameType,
      name: "Rock Paper Scissors",
      description: "Classic game against AI opponent",
      icon: "✂️",
      difficulty: "Easy",
      color: "from-blue-500 to-blue-600",
      estimatedTime: "2-5 min",
    },
    {
      id: "memory" as GameType,
      name: "Memory Match",
      description: "Flip cards to find matching pairs",
      icon: "🧠",
      difficulty: "Medium",
      color: "from-purple-500 to-purple-600",
      estimatedTime: "3-8 min",
    },
    {
      id: "minesweeper" as GameType,
      name: "Minesweeper",
      description: "Classic puzzle game with mines",
      icon: "💣",
      difficulty: "Hard",
      color: "from-red-500 to-red-600",
      estimatedTime: "5-15 min",
    },
    {
      id: "sliding" as GameType,
      name: "Sliding Puzzle",
      description: "Rearrange tiles to form the picture",
      icon: "🧩",
      difficulty: "Medium",
      color: "from-emerald-500 to-emerald-600",
      estimatedTime: "3-10 min",
    },
    {
      id: "hangman" as GameType,
      name: "Hangman",
      description: "Guess the tech word before you run out of tries",
      icon: "🎯",
      difficulty: "Medium",
      color: "from-pink-500 to-pink-600",
      estimatedTime: "3-8 min",
    },
    {
      id: "numberguess" as GameType,
      name: "Number Guessing",
      description: "Guess the secret number between 1 and 100",
      icon: "🔢",
      difficulty: "Easy",
      color: "from-cyan-500 to-cyan-600",
      estimatedTime: "2-5 min",
    },
    {
      id: "wordle" as GameType,
      name: "Wordle Clone",
      description: "Guess the 5-letter word in 6 tries",
      icon: "📝",
      difficulty: "Medium",
      color: "from-lime-500 to-lime-600",
      estimatedTime: "3-8 min",
    },
    {
      id: "snake" as GameType,
      name: "Snake",
      description: "Eat food and grow your snake",
      icon: "🐍",
      difficulty: "Medium",
      color: "from-green-500 to-green-600",
      estimatedTime: "3-10 min",
    },
    {
      id: "maze" as GameType,
      name: "Maze Escape",
      description: "Navigate the maze to escape",
      icon: "🌀",
      difficulty: "Hard",
      color: "from-indigo-500 to-indigo-600",
      estimatedTime: "5-15 min",
    },
    {
      id: "simon" as GameType,
      name: "Simon Says",
      description: "Repeat the color sequence",
      icon: "🟩",
      difficulty: "Medium",
      color: "from-yellow-500 to-yellow-600",
      estimatedTime: "3-8 min",
    },
    {
      id: "tictactoe" as GameType,
      name: "Tic Tac Toe",
      description: "Classic Xs and Os game",
      icon: "⭕",
      difficulty: "Easy",
      color: "from-gray-500 to-gray-600",
      estimatedTime: "2-5 min",
    },
    {
      id: "sorting" as GameType,
      name: "Sorting Challenge: CS Edition",
      description: "Drag and drop CS concepts into the correct categories",
      icon: "🧠",
      difficulty: "Medium",
      color: "from-green-400 to-green-600",
      estimatedTime: "3-10 min",
    },
  ];

  const handleGameSelect = (gameId: GameType) => {
    setCurrentGame(gameId);
  };

  const handleBackToMenu = () => {
    setCurrentGame("menu");
  };

  const handleGameComplete = (won: boolean, score: number) => {
    setGameStats((prev) => ({
      gamesPlayed: prev.gamesPlayed + 1,
      gamesWon: won ? prev.gamesWon + 1 : prev.gamesWon,
      totalScore: prev.totalScore + score,
      bestStreak: won ? Math.max(prev.bestStreak, prev.bestStreak + 1) : 0,
    }));
  };

  const renderGame = () => {
    switch (currentGame) {
      // case 'treasure':
      //   return <TreasureHunt onBack={handleBackToMenu} onComplete={handleGameComplete} />;
      case "rps":
        return (
          <RockPaperScissors
            onBack={handleBackToMenu}
            onComplete={handleGameComplete}
          />
        );
      case "memory":
        return (
          <MemoryMatch
            onBack={handleBackToMenu}
            onComplete={handleGameComplete}
          />
        );
      case "minesweeper":
        return (
          <Minesweeper
            onBack={handleBackToMenu}
            onComplete={handleGameComplete}
          />
        );
      case "sliding":
        return (
          <SlidingPuzzle
            onBack={handleBackToMenu}
            onComplete={handleGameComplete}
          />
        );
      case "hangman":
        return (
          <HangmanGame
            onBack={handleBackToMenu}
            onComplete={handleGameComplete}
          />
        );
      case "numberguess":
        return (
          <NumberGuessingGame
            onBack={handleBackToMenu}
            onComplete={handleGameComplete}
          />
        );
      case "wordle":
        return (
          <WordleClone
            onBack={handleBackToMenu}
            onComplete={handleGameComplete}
          />
        );
      case "snake":
        return (
          <SnakeGame
            onBack={handleBackToMenu}
            onComplete={handleGameComplete}
          />
        );
      case "maze":
        return (
          <MazeEscape
            onBack={handleBackToMenu}
            onComplete={handleGameComplete}
          />
        );
      case "simon":
        return (
          <SimonSays
            onBack={handleBackToMenu}
            onComplete={handleGameComplete}
          />
        );
      case "tictactoe":
        return (
          <TicTacToe
            onBack={handleBackToMenu}
            onComplete={handleGameComplete}
          />
        );
      case "sorting":
        return (
          <SortingGame
            onBack={handleBackToMenu}
            onComplete={handleGameComplete}
          />
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-500 to-purple-600">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {currentGame === "menu"
                  ? "Game Center"
                  : games.find((g) => g.id === currentGame)?.name}
              </h2>
              <p className="text-sm text-white/80">
                {currentGame === "menu"
                  ? "Choose your adventure!"
                  : "Have fun and earn points!"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {currentGame === "menu" ? (
            <div className="p-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 text-center border border-blue-200 dark:border-blue-800">
                  <Target className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                    {gameStats.gamesPlayed}
                  </p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    Games Played
                  </p>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl p-4 text-center border border-emerald-200 dark:border-emerald-800">
                  <Trophy className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-200">
                    {gameStats.gamesWon}
                  </p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">
                    Games Won
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 text-center border border-purple-200 dark:border-purple-800">
                  <Star className="w-6 h-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                    {gameStats.totalScore}
                  </p>
                  <p className="text-sm text-purple-600 dark:text-purple-400">
                    Total Score
                  </p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl p-4 text-center border border-amber-200 dark:border-amber-800">
                  <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-amber-800 dark:text-amber-200">
                    {gameStats.bestStreak}
                  </p>
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    Best Streak
                  </p>
                </div>
              </div>

              {/* Game Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {games.map((game) => (
                  <div
                    key={game.id}
                    onClick={() => handleGameSelect(game.id)}
                    className="group cursor-pointer bg-white dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600 hover:shadow-lg dark:hover:shadow-gray-900/30 transition-all duration-300 hover:scale-105"
                  >
                    <div
                      className={`w-16 h-16 rounded-xl bg-gradient-to-br ${game.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      {game.icon}
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                      {game.name}
                    </h3>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {game.description}
                    </p>

                    <div className="flex items-center justify-between text-xs">
                      <span
                        className={`px-2 py-1 rounded-full ${
                          game.difficulty === "Easy"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                            : game.difficulty === "Medium"
                            ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200"
                            : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
                        }`}
                      >
                        {game.difficulty}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {game.estimatedTime}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tips */}
              <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Star className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Gaming Tips
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Playing games helps improve cognitive skills, memory, and
                      problem-solving abilities. Take breaks between study
                      sessions and enjoy these brain-training games!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6">{renderGame()}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameModal;
