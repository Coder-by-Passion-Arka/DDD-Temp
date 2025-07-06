import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Clock, RotateCcw, Flag, Bomb } from 'lucide-react';

interface MinesweeperProps {
  onBack: () => void;
  onComplete: (won: boolean, score: number) => void;
}

interface Cell {
  id: number;
  row: number;
  col: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
}

const Minesweeper: React.FC<MinesweeperProps> = ({ onBack, onComplete }) => {
  const [board, setBoard] = useState<Cell[]>([]);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [minesLeft, setMinesLeft] = useState(10);
  const [score, setScore] = useState(0);
  const [firstClick, setFirstClick] = useState(true);

  const ROWS = 9;
  const COLS = 9;
  const MINES = 10;

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (gameStatus === 'playing') {
      timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameStatus]);

  const initializeGame = () => {
    const newBoard: Cell[] = [];
    
    // Create empty board
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        newBoard.push({
          id: row * COLS + col,
          row,
          col,
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          neighborMines: 0
        });
      }
    }

    setBoard(newBoard);
    setGameStatus('playing');
    setTimeElapsed(0);
    setMinesLeft(MINES);
    setScore(0);
    setFirstClick(true);
  };

  const placeMines = (excludeId: number) => {
    const newBoard = [...board];
    const availableCells = newBoard.filter(cell => cell.id !== excludeId);
    
    // Randomly place mines
    for (let i = 0; i < MINES; i++) {
      const randomIndex = Math.floor(Math.random() * availableCells.length);
      const cell = availableCells[randomIndex];
      cell.isMine = true;
      availableCells.splice(randomIndex, 1);
    }

    // Calculate neighbor mines
    newBoard.forEach(cell => {
      if (!cell.isMine) {
        cell.neighborMines = getNeighbors(cell.row, cell.col, newBoard)
          .filter(neighbor => neighbor.isMine).length;
      }
    });

    setBoard(newBoard);
  };

  const getNeighbors = (row: number, col: number, currentBoard: Cell[]) => {
    const neighbors: Cell[] = [];
    
    for (let r = row - 1; r <= row + 1; r++) {
      for (let c = col - 1; c <= col + 1; c++) {
        if (r >= 0 && r < ROWS && c >= 0 && c < COLS && !(r === row && c === col)) {
          const neighbor = currentBoard.find(cell => cell.row === r && cell.col === c);
          if (neighbor) neighbors.push(neighbor);
        }
      }
    }
    
    return neighbors;
  };

  const revealCell = (cellId: number) => {
    if (gameStatus !== 'playing') return;

    const cell = board.find(c => c.id === cellId);
    if (!cell || cell.isRevealed || cell.isFlagged) return;

    if (firstClick) {
      placeMines(cellId);
      setFirstClick(false);
    }

    const newBoard = [...board];
    const targetCell = newBoard.find(c => c.id === cellId)!;

    if (targetCell.isMine) {
      // Game over
      newBoard.forEach(c => {
        if (c.isMine) c.isRevealed = true;
      });
      setBoard(newBoard);
      setGameStatus('lost');
      onComplete(false, score);
      return;
    }

    // Reveal cell and potentially neighbors
    const toReveal = [targetCell];
    const revealed = new Set<number>();

    while (toReveal.length > 0) {
      const current = toReveal.pop()!;
      if (revealed.has(current.id)) continue;
      
      current.isRevealed = true;
      revealed.add(current.id);

      // If cell has no neighboring mines, reveal all neighbors
      if (current.neighborMines === 0) {
        const neighbors = getNeighbors(current.row, current.col, newBoard);
        neighbors.forEach(neighbor => {
          if (!neighbor.isRevealed && !neighbor.isFlagged && !neighbor.isMine) {
            toReveal.push(neighbor);
          }
        });
      }
    }

    setBoard(newBoard);

    // Check win condition
    const revealedCount = newBoard.filter(c => c.isRevealed).length;
    if (revealedCount === ROWS * COLS - MINES) {
      setGameStatus('won');
      const timeBonus = Math.max(0, 999 - timeElapsed);
      const finalScore = 1000 + timeBonus;
      setScore(finalScore);
      onComplete(true, finalScore);
    }
  };

  const toggleFlag = (cellId: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (gameStatus !== 'playing') return;

    const cell = board.find(c => c.id === cellId);
    if (!cell || cell.isRevealed) return;

    const newBoard = [...board];
    const targetCell = newBoard.find(c => c.id === cellId)!;
    targetCell.isFlagged = !targetCell.isFlagged;

    setBoard(newBoard);
    setMinesLeft(prev => targetCell.isFlagged ? prev - 1 : prev + 1);
  };

  const getCellDisplay = (cell: Cell) => {
    if (cell.isFlagged) {
      return <Flag className="w-4 h-4 text-red-500" />;
    }
    
    if (!cell.isRevealed) {
      return '';
    }
    
    if (cell.isMine) {
      return <Bomb className="w-4 h-4 text-red-600" />;
    }
    
    if (cell.neighborMines > 0) {
      return cell.neighborMines;
    }
    
    return '';
  };

  const getCellColor = (cell: Cell) => {
    if (cell.isFlagged) {
      return 'bg-yellow-200 dark:bg-yellow-800 border-yellow-400 dark:border-yellow-600';
    }
    
    if (!cell.isRevealed) {
      return 'bg-gray-300 dark:bg-gray-600 border-gray-400 dark:border-gray-500 hover:bg-gray-200 dark:hover:bg-gray-500';
    }
    
    if (cell.isMine) {
      return 'bg-red-200 dark:bg-red-800 border-red-400 dark:border-red-600';
    }
    
    return 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600';
  };

  const getNumberColor = (num: number) => {
    const colors = [
      '', 'text-blue-600', 'text-green-600', 'text-red-600',
      'text-purple-600', 'text-yellow-600', 'text-pink-600',
      'text-gray-600', 'text-black'
    ];
    return colors[num] || 'text-gray-600';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (gameStatus === 'won') {
    return (
      <div className="text-center py-8">
        <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Trophy className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          🎉 Mine Cleared! 🎉
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
          Excellent work! You successfully cleared all mines!
        </p>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl p-6 border border-emerald-200 dark:border-emerald-800 mb-6">
          <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-200 mb-2">
            Score: {score} points
          </p>
          <p className="text-sm text-emerald-700 dark:text-emerald-300">
            Completed in: {formatTime(timeElapsed)}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={initializeGame}
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

  if (gameStatus === 'lost') {
    return (
      <div className="text-center py-8">
        <div className="w-24 h-24 bg-gradient-to-br from-red-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Bomb className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          💥 Mine Hit! 💥
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
          Oops! You hit a mine. Better luck next time!
        </p>
        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl p-6 border border-red-200 dark:border-red-800 mb-6">
          <p className="text-lg font-bold text-red-800 dark:text-red-200">
            Time survived: {formatTime(timeElapsed)}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={initializeGame}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors duration-200"
          >
            Try Again
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
        
        <button
          onClick={initializeGame}
          className="flex items-center space-x-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 text-center border border-red-200 dark:border-red-800">
          <Bomb className="w-6 h-6 text-red-600 dark:text-red-400 mx-auto mb-2" />
          <p className="text-lg font-bold text-red-800 dark:text-red-200">{minesLeft}</p>
          <p className="text-sm text-red-600 dark:text-red-400">Mines Left</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center border border-blue-200 dark:border-blue-800">
          <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
          <p className="text-lg font-bold text-blue-800 dark:text-blue-200">{formatTime(timeElapsed)}</p>
          <p className="text-sm text-blue-600 dark:text-blue-400">Time</p>
        </div>
      </div>

      {/* Game Board */}
      <div className="bg-white dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600 mb-6">
        <div className="grid grid-cols-9 gap-1 max-w-md mx-auto">
          {board.map((cell) => (
            <button
              key={cell.id}
              onClick={() => revealCell(cell.id)}
              onContextMenu={(e) => toggleFlag(cell.id, e)}
              className={`w-8 h-8 border-2 text-xs font-bold flex items-center justify-center transition-all duration-200 ${getCellColor(cell)} ${
                cell.isRevealed && cell.neighborMines > 0 ? getNumberColor(cell.neighborMines) : ''
              }`}
            >
              {getCellDisplay(cell)}
            </button>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
          💣 How to Play
        </h4>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          <strong>Left click:</strong> Reveal cell • <strong>Right click:</strong> Flag/unflag mine
          <br />
          Numbers show how many mines are adjacent. Clear all non-mine cells to win!
        </p>
      </div>
    </div>
  );
};

export default Minesweeper;