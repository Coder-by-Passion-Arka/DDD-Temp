import React, { useState } from 'react';
import { ArrowLeft, Trophy, Target, Zap } from 'lucide-react';

interface RockPaperScissorsProps {
  onBack: () => void;
  onComplete: (won: boolean, score: number) => void;
}

type Choice = 'rock' | 'paper' | 'scissors' | null;
type GameResult = 'win' | 'lose' | 'tie' | null;

const RockPaperScissors: React.FC<RockPaperScissorsProps> = ({ onBack, onComplete }) => {
  const [playerChoice, setPlayerChoice] = useState<Choice>(null);
  const [aiChoice, setAiChoice] = useState<Choice>(null);
  const [result, setResult] = useState<GameResult>(null);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [ties, setTies] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const choices = [
    { id: 'rock', name: 'Rock', emoji: '🪨', color: 'from-gray-500 to-gray-600' },
    { id: 'paper', name: 'Paper', emoji: '📄', color: 'from-blue-500 to-blue-600' },
    { id: 'scissors', name: 'Scissors', emoji: '✂️', color: 'from-red-500 to-red-600' }
  ];

  const getRandomChoice = (): Choice => {
    const choices = ['rock', 'paper', 'scissors'] as Choice[];
    return choices[Math.floor(Math.random() * choices.length)];
  };

  const determineWinner = (player: Choice, ai: Choice): GameResult => {
    if (player === ai) return 'tie';
    
    if (
      (player === 'rock' && ai === 'scissors') ||
      (player === 'paper' && ai === 'rock') ||
      (player === 'scissors' && ai === 'paper')
    ) {
      return 'win';
    }
    
    return 'lose';
  };

  const handleChoice = (choice: Choice) => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    setPlayerChoice(choice);
    setShowResult(false);
    
    // Simulate AI thinking time
    setTimeout(() => {
      const ai = getRandomChoice();
      setAiChoice(ai);
      
      const gameResult = determineWinner(choice, ai);
      setResult(gameResult);
      
      // Update stats
      if (gameResult === 'win') {
        setWins(wins + 1);
        setScore(score + 100);
      } else if (gameResult === 'lose') {
        setLosses(losses + 1);
      } else {
        setTies(ties + 1);
        setScore(score + 25);
      }
      
      setShowResult(true);
      setIsPlaying(false);
    }, 1500);
  };

  const nextRound = () => {
    if (round >= 10) {
      // Game complete
      const finalWon = wins > losses;
      onComplete(finalWon, score);
      return;
    }
    
    setRound(round + 1);
    setPlayerChoice(null);
    setAiChoice(null);
    setResult(null);
    setShowResult(false);
  };

  const resetGame = () => {
    setPlayerChoice(null);
    setAiChoice(null);
    setResult(null);
    setScore(0);
    setRound(1);
    setWins(0);
    setLosses(0);
    setTies(0);
    setIsPlaying(false);
    setShowResult(false);
  };

  const getChoiceData = (choice: Choice) => {
    return choices.find(c => c.id === choice);
  };

  const getResultMessage = () => {
    switch (result) {
      case 'win': return '🎉 You Win!';
      case 'lose': return '😔 You Lose!';
      case 'tie': return '🤝 It\'s a Tie!';
      default: return '';
    }
  };

  const getResultColor = () => {
    switch (result) {
      case 'win': return 'text-emerald-600 dark:text-emerald-400';
      case 'lose': return 'text-red-600 dark:text-red-400';
      case 'tie': return 'text-yellow-600 dark:text-yellow-400';
      default: return '';
    }
  };

  if (round > 10) {
    const finalWon = wins > losses;
    return (
      <div className="text-center py-8">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
          finalWon ? 'bg-gradient-to-br from-emerald-400 to-emerald-500' : 'bg-gradient-to-br from-red-400 to-red-500'
        }`}>
          <Trophy className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {finalWon ? '🎉 Victory! 🎉' : '😔 Game Over 😔'}
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
          {finalWon ? 'Congratulations! You won the match!' : 'Better luck next time!'}
        </p>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{wins}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Wins</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{losses}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Losses</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{ties}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ties</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-700">
            <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
              Final Score: {score} points
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={resetGame}
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
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
            <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Round {round}/10
            </span>
          </div>
          <div className="flex items-center space-x-2 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 rounded-full">
            <Trophy className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              {score} pts
            </span>
          </div>
        </div>
      </div>

      {/* Score Board */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 text-center border border-emerald-200 dark:border-emerald-800">
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{wins}</p>
          <p className="text-sm text-emerald-700 dark:text-emerald-300">Wins</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 text-center border border-red-200 dark:border-red-800">
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{losses}</p>
          <p className="text-sm text-red-700 dark:text-red-300">Losses</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 text-center border border-yellow-200 dark:border-yellow-800">
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{ties}</p>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">Ties</p>
        </div>
      </div>

      {/* Game Area */}
      <div className="bg-white dark:bg-gray-700 rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-600 mb-6">
        {/* Choices Display */}
        <div className="flex flex-col gap-6 sm:grid sm:grid-cols-2 sm:gap-8 mb-8">
          {/* Player */}
          <div className="text-center">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-4">You</h3>
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-2 sm:mb-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              {playerChoice ? (
                <span className="text-3xl sm:text-4xl">{getChoiceData(playerChoice)?.emoji}</span>
              ) : (
                <span className="text-xl sm:text-2xl text-white">?</span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {playerChoice ? getChoiceData(playerChoice)?.name : 'Make your choice'}
            </p>
          </div>

          {/* AI */}
          <div className="text-center">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-4">AI</h3>
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-2 sm:mb-4 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
              {isPlaying ? (
                <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-white animate-pulse" />
              ) : aiChoice ? (
                <span className="text-3xl sm:text-4xl">{getChoiceData(aiChoice)?.emoji}</span>
              ) : (
                <span className="text-xl sm:text-2xl text-white">?</span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {isPlaying ? 'Thinking...' : aiChoice ? getChoiceData(aiChoice)?.name : 'Waiting...'}
            </p>
          </div>
        </div>

        {/* Result */}
        {showResult && (
          <div className="text-center mb-6">
            <h2 className={`text-lg sm:text-2xl font-bold mb-2 ${getResultColor()}`}>
              {getResultMessage()}
            </h2>
            <button
              onClick={nextRound}
              className="px-4 py-2 sm:px-6 sm:py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors duration-200 text-sm sm:text-base"
            >
              {round >= 10 ? 'View Results' : 'Next Round'}
            </button>
          </div>
        )}

        {/* Choice Buttons */}
        {!showResult && (
          <div>
            <h3 className="text-center text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-4">
              Choose your weapon:
            </h3>
            <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full">
              {choices.map((choice) => (
                <button
                  key={choice.id}
                  onClick={() => handleChoice(choice.id as Choice)}
                  disabled={isPlaying}
                  className={`w-full p-4 sm:p-6 rounded-xl border-2 transition-all duration-200 ${
                    isPlaying 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:scale-105 hover:shadow-lg border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500'
                  } bg-white dark:bg-gray-800 flex flex-col items-center`}
                >
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 mb-2 sm:mb-3 rounded-full bg-gradient-to-br ${choice.color} flex items-center justify-center`}>
                    <span className="text-xl sm:text-2xl">{choice.emoji}</span>
                  </div>
                  <p className="font-medium text-xs sm:text-base text-gray-900 dark:text-white">{choice.name}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Rules */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
          📋 Rules
        </h4>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Rock beats Scissors • Paper beats Rock • Scissors beats Paper
          <br />
          Win: +100 points • Tie: +25 points • Best of 10 rounds!
        </p>
      </div>
    </div>
  );
};

export default RockPaperScissors;