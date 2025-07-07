import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Clock, RotateCcw, Shuffle, Target } from 'lucide-react';

interface SlidingPuzzleProps {
  onBack: () => void;
  onComplete: (won: boolean, score: number) => void;
}

const SlidingPuzzle: React.FC<SlidingPuzzleProps> = ({ onBack, onComplete }) => {
  const [tiles, setTiles] = useState<number[]>([]);
  const [emptyIndex, setEmptyIndex] = useState(8);
  const [moves, setMoves] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won'>('playing');
  const [score, setScore] = useState(0);
  const [isShuffling, setIsShuffling] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const GRID_SIZE = 3;
  const TOTAL_TILES = GRID_SIZE * GRID_SIZE;

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (gameStatus === 'playing' && gameStarted) {
      timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameStatus, gameStarted]);

  useEffect(() => {
    if (isWinningState(tiles) && moves > 0 && gameStarted) {
      setGameStatus('won');
      const timeBonus = Math.max(0, 300 - timeElapsed);
      const moveBonus = Math.max(0, (50 - moves) * 10);
      const finalScore = 1000 + timeBonus + moveBonus;
      setScore(finalScore);
      onComplete(true, finalScore);
    }
  }, [tiles, moves, timeElapsed, gameStarted, onComplete]);

  const initializeGame = () => {
    const initialTiles = Array.from({ length: TOTAL_TILES - 1 }, (_, i) => i + 1);
    initialTiles.push(0); // 0 represents empty space
    
    setTiles(initialTiles);
    setEmptyIndex(TOTAL_TILES - 1);
    setMoves(0);
    setTimeElapsed(0);
    setGameStatus('playing');
    setScore(0);
    setGameStarted(false);
  };

  const shufflePuzzle = async () => {
    setIsShuffling(true);
    let currentTiles = [1, 2, 3, 4, 5, 6, 7, 8, 0]; // Start with solved state
    let currentEmpty = 8;

    // Perform random valid moves to shuffle
    for (let i = 0; i < 1000; i++) {
      const validMoves = getValidMoves(currentEmpty, currentTiles);
      const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
      
      // Swap tiles
      [currentTiles[currentEmpty], currentTiles[randomMove]] = 
      [currentTiles[randomMove], currentTiles[currentEmpty]];
      currentEmpty = randomMove;
    }

    setTiles(currentTiles);
    setEmptyIndex(currentEmpty);
    setMoves(0);
    setTimeElapsed(0);
    setGameStatus('playing');
    setScore(0);
    setGameStarted(true); // Start the game after shuffling
    
    setTimeout(() => setIsShuffling(false), 500);
  };

  const getValidMoves = (emptyPos: number, currentTiles?: number[]) => {
    const row = Math.floor(emptyPos / GRID_SIZE);
    const col = emptyPos % GRID_SIZE;
    const validMoves: number[] = [];

    // Up
    if (row > 0) validMoves.push(emptyPos - GRID_SIZE);
    // Down
    if (row < GRID_SIZE - 1) validMoves.push(emptyPos + GRID_SIZE);
    // Left
    if (col > 0) validMoves.push(emptyPos - 1);
    // Right
    if (col < GRID_SIZE - 1) validMoves.push(emptyPos + 1);

    return validMoves;
  };

  const isWinningState = (currentTiles: number[]) => {
    for (let i = 0; i < TOTAL_TILES - 1; i++) {
      if (currentTiles[i] !== i + 1) return false;
    }
    return currentTiles[TOTAL_TILES - 1] === 0;
  };

  const handleTileClick = (index: number) => {
    if (gameStatus !== 'playing' || isShuffling) return;

    // Start the game on first move if not started
    if (!gameStarted) {
      setGameStarted(true);
    }

    const validMoves = getValidMoves(emptyIndex);
    if (!validMoves.includes(index)) return;

    const newTiles = [...tiles];
    [newTiles[emptyIndex], newTiles[index]] = [newTiles[index], newTiles[emptyIndex]];
    
    setTiles(newTiles);
    setEmptyIndex(index);
    setMoves(prev => prev + 1);
  };

  const getTileColor = (tileNumber: number, index: number) => {
    if (tileNumber === 0) return 'bg-gray-200 dark:bg-gray-600';
    
    const isCorrectPosition = tileNumber === index + 1;
    if (isCorrectPosition) {
      return 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200';
    }
    
    return 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-900/50';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getHint = () => {
    const wrongTiles = tiles.filter((tile, index) => tile !== 0 && tile !== index + 1).length;
    return `${wrongTiles} tiles in wrong position`;
  };

  // Auto-shuffle on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      shufflePuzzle();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (gameStatus === 'won') {
    return (
      <div className="text-center py-8">
        <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Trophy className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          🧩 Puzzle Solved! 🧩
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
          Excellent! You've arranged all tiles correctly!
        </p>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800 mb-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">{score}</p>
              <p className="text-sm text-purple-700 dark:text-purple-300">Final Score</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">{moves}</p>
              <p className="text-sm text-purple-700 dark:text-purple-300">Moves</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-700 text-center">
            <p className="text-lg font-bold text-purple-800 dark:text-purple-200">
              Time: {formatTime(timeElapsed)}
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={shufflePuzzle}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors duration-200"
          >
            Play Again
          </button>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-colors duration-200"
          >
            Back to Games
          </button>
        </div>
      </div>
    );
  }

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
        
        <div className="flex items-center space-x-2">
          <button
            onClick={shufflePuzzle}
            disabled={isShuffling}
            className="flex items-center space-x-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg transition-colors duration-200"
          >
            <Shuffle className={`w-4 h-4 ${isShuffling ? 'animate-spin' : ''}`} />
            <span>New Game</span>
          </button>
          <button
            onClick={initializeGame}
            className="flex items-center space-x-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
        </div>
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
          <p className="text-lg font-bold text-purple-800 dark:text-purple-200">{moves}</p>
          <p className="text-sm text-purple-600 dark:text-purple-400">Moves</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 text-center border border-emerald-200 dark:border-emerald-800">
          <Trophy className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
          <p className="text-lg font-bold text-emerald-800 dark:text-emerald-200">{score}</p>
          <p className="text-sm text-emerald-600 dark:text-emerald-400">Score</p>
        </div>
      </div>

      {/* Game Status */}
      {!gameStarted && !isShuffling && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800 mb-6 text-center">
          <p className="text-yellow-800 dark:text-yellow-200 font-medium">
            🎮 Click "New Game" to shuffle and start playing!
          </p>
        </div>
      )}

      {isShuffling && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800 mb-6 text-center">
          <p className="text-blue-800 dark:text-blue-200 font-medium">
            🔄 Shuffling puzzle...
          </p>
        </div>
      )}

      {/* Game Board */}
      <div className="bg-white dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600 mb-6">
        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
          {tiles.map((tile, index) => (
            <button
              key={index}
              onClick={() => handleTileClick(index)}
              disabled={tile === 0 || isShuffling || !gameStarted}
              className={`aspect-square rounded-lg border-2 transition-all duration-200 ${getTileColor(tile, index)} ${
                tile === 0 
                  ? 'cursor-default' 
                  : gameStarted && getValidMoves(emptyIndex).includes(index)
                  ? 'cursor-pointer hover:scale-105 hover:shadow-md'
                  : 'cursor-not-allowed opacity-60'
              } flex items-center justify-center text-2xl font-bold`}
            >
              {tile !== 0 && (
                <span className={isShuffling ? 'animate-pulse' : ''}>{tile}</span>
              )}
            </button>
          ))}
        </div>

        {/* Goal State */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
          <h4 className="text-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Goal State:
          </h4>
          <div className="grid grid-cols-3 gap-1 max-w-32 mx-auto">
            {[1, 2, 3, 4, 5, 6, 7, 8, 0].map((tile, index) => (
              <div
                key={index}
                className={`aspect-square rounded border text-xs font-bold flex items-center justify-center ${
                  tile === 0 
                    ? 'bg-gray-200 dark:bg-gray-600' 
                    : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200'
                }`}
              >
                {tile !== 0 && tile}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hint */}
      {gameStarted && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800 mb-4">
          <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
            💡 Hint
          </h4>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            {getHint()}
          </p>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
          🧩 How to Play
        </h4>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Click tiles adjacent to the empty space to move them. Arrange numbers 1-8 in order with the empty space in the bottom-right corner.
          <br />
          <strong>Scoring:</strong> Base 1000 points + time bonus + move efficiency bonus
        </p>
      </div>
    </div>
  );
};

export default SlidingPuzzle;