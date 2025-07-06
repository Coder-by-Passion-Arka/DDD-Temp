import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Clock, RotateCcw, Star } from 'lucide-react';

interface MemoryMatchProps {
  onBack: () => void;
  onComplete: (won: boolean, score: number) => void;
}

interface Card {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const MemoryMatch: React.FC<MemoryMatchProps> = ({ onBack, onComplete }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [score, setScore] = useState(0);

  const symbols = ['🎯', '🎮', '🎨', '🎭', '🎪', '🎸', '🎺', '🎻'];
  const totalPairs = symbols.length;

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    let timer: number;
    if (gameStatus === 'playing') {
      timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameStatus]);

  useEffect(() => {
    if (matchedPairs === totalPairs && gameStatus === 'playing') {
      setGameStatus('won');
      const timeBonus = Math.max(0, 300 - timeElapsed); // Bonus for completing quickly
      const moveBonus = Math.max(0, (totalPairs * 2 - moves) * 10); // Bonus for fewer moves
      const finalScore = 1000 + timeBonus + moveBonus;
      setScore(finalScore);
      onComplete(true, finalScore);
    }
  }, [matchedPairs, totalPairs, gameStatus, timeElapsed, moves, onComplete]);

  const initializeGame = () => {
    const gameCards: Card[] = [];
    symbols.forEach((symbol, index) => {
      // Add two cards for each symbol
      gameCards.push(
        { id: index * 2, symbol, isFlipped: false, isMatched: false },
        { id: index * 2 + 1, symbol, isFlipped: false, isMatched: false }
      );
    });
    
    // Shuffle cards
    const shuffledCards = gameCards.sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setTimeElapsed(0);
    setGameStatus('playing');
    setScore(0);
  };

  const handleCardClick = (cardId: number) => {
    if (gameStatus !== 'playing') return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched || flippedCards.length >= 2) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    // Update card state
    setCards(prev => prev.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    ));

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      
      const [firstId, secondId] = newFlippedCards;
      const firstCard = cards.find(c => c.id === firstId);
      const secondCard = cards.find(c => c.id === secondId);

      if (firstCard && secondCard && firstCard.symbol === secondCard.symbol) {
        // Match found
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId 
              ? { ...c, isMatched: true }
              : c
          ));
          setMatchedPairs(prev => prev + 1);
          setFlippedCards([]);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            c.id === firstId || c.id === secondId 
              ? { ...c, isFlipped: false }
              : c
          ));
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStarRating = () => {
    if (moves <= totalPairs * 1.5) return 3;
    if (moves <= totalPairs * 2) return 2;
    return 1;
  };

  if (gameStatus === 'won') {
    const stars = getStarRating();
    return (
      <div className="text-center py-8">
        <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Trophy className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          🎉 Perfect Memory! 🎉
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
          Congratulations! You matched all pairs!
        </p>
        
        {/* Star Rating */}
        <div className="flex justify-center mb-6">
          {[1, 2, 3].map((star) => (
            <Star
              key={star}
              className={`w-8 h-8 ${
                star <= stars 
                  ? 'text-yellow-400 fill-current' 
                  : 'text-gray-300 dark:text-gray-600'
              }`}
            />
          ))}
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800 mb-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">{score}</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">Final Score</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">{moves}</p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">Moves</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-yellow-200 dark:border-yellow-700 text-center">
            <p className="text-lg font-bold text-yellow-800 dark:text-yellow-200">
              Time: {formatTime(timeElapsed)}
            </p>
          </div>
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
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center border border-blue-200 dark:border-blue-800">
          <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
          <p className="text-lg font-bold text-blue-800 dark:text-blue-200">{formatTime(timeElapsed)}</p>
          <p className="text-sm text-blue-600 dark:text-blue-400">Time</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center border border-purple-200 dark:border-purple-800">
          <Trophy className="w-6 h-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
          <p className="text-lg font-bold text-purple-800 dark:text-purple-200">{moves}</p>
          <p className="text-sm text-purple-600 dark:text-purple-400">Moves</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 text-center border border-emerald-200 dark:border-emerald-800">
          <Star className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
          <p className="text-lg font-bold text-emerald-800 dark:text-emerald-200">{matchedPairs}/{totalPairs}</p>
          <p className="text-sm text-emerald-600 dark:text-emerald-400">Pairs</p>
        </div>
      </div>

      {/* Game Board */}
      <div className="bg-white dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600 mb-6">
        <div className="grid grid-cols-4 gap-3">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              disabled={card.isFlipped || card.isMatched || flippedCards.length >= 2}
              className={`aspect-square rounded-lg border-2 transition-all duration-300 ${
                card.isMatched
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700 scale-95'
                  : card.isFlipped
                  ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700'
                  : 'bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 hover:bg-gray-200 dark:hover:bg-gray-500 hover:scale-105'
              } flex items-center justify-center text-2xl font-bold`}
            >
              {card.isFlipped || card.isMatched ? (
                <span className={card.isMatched ? 'opacity-60' : ''}>{card.symbol}</span>
              ) : (
                <span className="text-gray-400 dark:text-gray-500">?</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
          🧠 How to Play
        </h4>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Click cards to flip them and find matching pairs. Try to complete the game in as few moves as possible!
          <br />
          <strong>Scoring:</strong> Base 1000 points + time bonus + move efficiency bonus
        </p>
      </div>
    </div>
  );
};

export default MemoryMatch;