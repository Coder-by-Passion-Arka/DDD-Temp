import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Trophy, Clock, Lightbulb, Navigation, Search, Eye, CheckCircle } from 'lucide-react';

interface TreasureHuntProps {
  onBack: () => void;
  onComplete: (won: boolean, score: number) => void;
}

interface Location {
  id: number;
  name: string;
  x: number;
  y: number;
  emoji: string;
  description: string;
  hasClue: boolean;
  clueFound: boolean;
  isAccessible: boolean;
}

interface Clue {
  id: number;
  locationId: number;
  question: string;
  hint: string;
  answer: string;
  points: number;
  found: boolean;
}

const TreasureHunt: React.FC<TreasureHuntProps> = ({ onBack, onComplete }) => {
  const [currentLocation, setCurrentLocation] = useState(1);
  const [userAnswer, setUserAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [foundClues, setFoundClues] = useState<number[]>([]);
  const [currentClue, setCurrentClue] = useState<Clue | null>(null);
  const [showClueModal, setShowClueModal] = useState(false);
  const [exploredLocations, setExploredLocations] = useState<number[]>([1]);

  const locations: Location[] = [
    {
      id: 1,
      name: "University Entrance",
      x: 50,
      y: 80,
      emoji: "🏛️",
      description: "The grand entrance to the university. Your adventure begins here!",
      hasClue: false,
      clueFound: false,
      isAccessible: true
    },
    {
      id: 2,
      name: "Library",
      x: 20,
      y: 60,
      emoji: "📚",
      description: "A vast repository of knowledge with towering shelves.",
      hasClue: true,
      clueFound: false,
      isAccessible: true
    },
    {
      id: 3,
      name: "Computer Lab",
      x: 80,
      y: 60,
      emoji: "💻",
      description: "Rows of computers humming with digital activity.",
      hasClue: true,
      clueFound: false,
      isAccessible: false
    },
    {
      id: 4,
      name: "Clock Tower",
      x: 50,
      y: 30,
      emoji: "🕐",
      description: "An ancient tower that has watched over the campus for decades.",
      hasClue: true,
      clueFound: false,
      isAccessible: false
    },
    {
      id: 5,
      name: "Student Center",
      x: 30,
      y: 40,
      emoji: "🏢",
      description: "The heart of student life, bustling with activity.",
      hasClue: true,
      clueFound: false,
      isAccessible: false
    },
    {
      id: 6,
      name: "Geography Dept",
      x: 70,
      y: 40,
      emoji: "🗺️",
      description: "Maps and globes fill this academic department.",
      hasClue: true,
      clueFound: false,
      isAccessible: false
    },
    {
      id: 7,
      name: "Secret Treasure",
      x: 50,
      y: 10,
      emoji: "💎",
      description: "The final treasure awaits those who solve all clues!",
      hasClue: false,
      clueFound: false,
      isAccessible: false
    }
  ];

  const clues: Clue[] = [
    {
      id: 1,
      locationId: 2,
      question: "I'm a place where knowledge flows like a river, with shelves that reach toward the sky. Students come to me when they seek wisdom. What am I?",
      hint: "Think about where books are kept in large quantities...",
      answer: "library",
      points: 100,
      found: false
    },
    {
      id: 2,
      locationId: 3,
      question: "I have keys but no locks, I have space but no room. You can enter but not go inside. What am I?",
      hint: "Think about something you use every day for typing...",
      answer: "keyboard",
      points: 150,
      found: false
    },
    {
      id: 3,
      locationId: 6,
      question: "I'm round like the world, but flat as a board. I show you places you've never been before. What am I?",
      hint: "Think about something that shows geography...",
      answer: "map",
      points: 120,
      found: false
    },
    {
      id: 4,
      locationId: 4,
      question: "I have a face but no eyes, hands but no fingers. I tell you something important every second. What am I?",
      hint: "Think about something that shows time...",
      answer: "clock",
      points: 130,
      found: false
    },
    {
      id: 5,
      locationId: 5,
      question: "I'm filled with knowledge but I'm not alive. I have pages but I'm not a book. Students carry me everywhere. What am I?",
      hint: "Think about something students use to take notes...",
      answer: "notebook",
      points: 200,
      found: false
    }
  ];

  useEffect(() => {
    if (timeLeft > 0 && gameStatus === 'playing') {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setGameStatus('lost');
      onComplete(false, score);
    }
  }, [timeLeft, gameStatus, score, onComplete]);

  useEffect(() => {
    // Check if all clues are found
    if (foundClues.length === clues.length && gameStatus === 'playing') {
      // Unlock treasure location
      setExploredLocations(prev => [...prev, 7]);
      // Auto-move to treasure
      setCurrentLocation(7);
      setGameStatus('won');
      const timeBonus = timeLeft * 2;
      const finalScore = score + timeBonus;
      setScore(finalScore);
      onComplete(true, finalScore);
    }
  }, [foundClues, clues.length, gameStatus, score, timeLeft, onComplete]);

  const moveToLocation = (locationId: number) => {
    const location = locations.find(l => l.id === locationId);
    if (!location || !location.isAccessible) return;

    setCurrentLocation(locationId);
    
    // Add to explored locations
    if (!exploredLocations.includes(locationId)) {
      setExploredLocations(prev => [...prev, locationId]);
    }

    // Check if location has a clue
    if (location.hasClue && !location.clueFound) {
      const clue = clues.find(c => c.locationId === locationId);
      if (clue && !foundClues.includes(clue.id)) {
        setCurrentClue(clue);
        setShowClueModal(true);
        setShowHint(false);
        setUserAnswer('');
      }
    }
  };

  const exploreLocation = (locationId: number) => {
    const location = locations.find(l => l.id === locationId);
    if (!location) return;

    // Make adjacent locations accessible
    const currentLoc = locations.find(l => l.id === currentLocation);
    if (currentLoc) {
      const distance = Math.sqrt(
        Math.pow(location.x - currentLoc.x, 2) + Math.pow(location.y - currentLoc.y, 2)
      );
      
      if (distance <= 30) { // Adjacent locations
        location.isAccessible = true;
        moveToLocation(locationId);
      }
    }
  };

  const handleSubmitAnswer = () => {
    if (!currentClue) return;

    const isCorrect = userAnswer.toLowerCase().trim() === currentClue.answer.toLowerCase();

    if (isCorrect) {
      const newScore = score + currentClue.points + (showHint ? 0 : 50);
      setScore(newScore);
      setFoundClues([...foundClues, currentClue.id]);
      
      // Mark clue as found
      const location = locations.find(l => l.id === currentClue.locationId);
      if (location) {
        location.clueFound = true;
      }

      // Unlock new locations based on clues found
      if (foundClues.length === 0) {
        // First clue unlocks computer lab and geography dept
        locations.find(l => l.id === 3)!.isAccessible = true;
        locations.find(l => l.id === 6)!.isAccessible = true;
      } else if (foundClues.length === 2) {
        // Third clue unlocks clock tower and student center
        locations.find(l => l.id === 4)!.isAccessible = true;
        locations.find(l => l.id === 5)!.isAccessible = true;
      }

      setShowClueModal(false);
      setCurrentClue(null);
    } else {
      setShowHint(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentLocationData = () => {
    return locations.find(l => l.id === currentLocation);
  };

  if (gameStatus === 'won') {
    return (
      <div className="text-center py-8">
        <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Trophy className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          🏆 Treasure Found! 🏆
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
          Congratulations! You've discovered the legendary campus treasure!
        </p>
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800 mb-6">
          <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-200 mb-2">
            Final Score: {score} points
          </p>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            Time remaining: {formatTime(timeLeft)} • Clues found: {foundClues.length}/{clues.length}
          </p>
        </div>
        <button
          onClick={onBack}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors duration-200"
        >
          Back to Games
        </button>
      </div>
    );
  }

  if (gameStatus === 'lost') {
    return (
      <div className="text-center py-8">
        <div className="w-24 h-24 bg-gradient-to-br from-red-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          ⏰ Time's Up! ⏰
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
          The treasure hunt has ended. The treasure remains hidden!
        </p>
        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl p-6 border border-red-200 dark:border-red-800 mb-6">
          <p className="text-2xl font-bold text-red-800 dark:text-red-200 mb-2">
            Score: {score} points
          </p>
          <p className="text-sm text-red-700 dark:text-red-300">
            Clues found: {foundClues.length}/{clues.length}
          </p>
        </div>
        <button
          onClick={onBack}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors duration-200"
        >
          Back to Games
        </button>
      </div>
    );
  }

  const currentLocationData = getCurrentLocationData();

  return (
    <div className="max-w-4xl mx-auto">
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
            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              {formatTime(timeLeft)}
            </span>
          </div>
          <div className="flex items-center space-x-2 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 rounded-full">
            <Trophy className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              {score} pts
            </span>
          </div>
          <div className="flex items-center space-x-2 bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 rounded-full">
            <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
              {foundClues.length}/{clues.length}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map */}
        <div className="bg-white dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <Navigation className="w-5 h-5" />
            <span>Campus Map</span>
          </h3>
          
          <div className="relative bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/20 dark:to-green-800/20 rounded-lg h-80 border border-green-300 dark:border-green-700">
            {locations.map((location) => (
              <button
                key={location.id}
                onClick={() => exploreLocation(location.id)}
                disabled={!location.isAccessible && location.id !== currentLocation}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-2 transition-all duration-200 ${
                  location.id === currentLocation
                    ? 'bg-blue-500 border-blue-600 scale-125 shadow-lg'
                    : location.isAccessible
                    ? exploredLocations.includes(location.id)
                      ? 'bg-emerald-500 border-emerald-600 hover:scale-110'
                      : 'bg-yellow-500 border-yellow-600 hover:scale-110'
                    : 'bg-gray-400 border-gray-500 opacity-50 cursor-not-allowed'
                } flex items-center justify-center text-white font-bold text-lg`}
                style={{ left: `${location.x}%`, top: `${location.y}%` }}
                title={location.name}
              >
                {location.emoji}
                {location.hasClue && location.clueFound && (
                  <CheckCircle className="absolute -top-1 -right-1 w-4 h-4 text-emerald-400 bg-white rounded-full" />
                )}
              </button>
            ))}
            
            {/* Legend */}
            <div className="absolute bottom-2 left-2 bg-white dark:bg-gray-800 rounded-lg p-2 text-xs">
              <div className="flex items-center space-x-1 mb-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">Current</span>
              </div>
              <div className="flex items-center space-x-1 mb-1">
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">Explored</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-700 dark:text-gray-300">Available</span>
              </div>
            </div>
          </div>
        </div>

        {/* Current Location Info */}
        <div className="bg-white dark:bg-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <Eye className="w-5 h-5" />
            <span>Current Location</span>
          </h3>
          
          {currentLocationData && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-6xl mb-2">{currentLocationData.emoji}</div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                  {currentLocationData.name}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {currentLocationData.description}
                </p>
              </div>

              {currentLocationData.hasClue && (
                <div className={`p-4 rounded-lg border ${
                  currentLocationData.clueFound
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                    : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                }`}>
                  {currentLocationData.clueFound ? (
                    <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-300">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Clue already found!</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-amber-700 dark:text-amber-300">
                      <Search className="w-5 h-5" />
                      <span className="font-medium">There's a clue here to discover!</span>
                    </div>
                  )}
                </div>
              )}

              {/* Available Actions */}
              <div className="space-y-2">
                <h5 className="font-medium text-gray-900 dark:text-white">Available Locations:</h5>
                {locations
                  .filter(l => l.isAccessible && l.id !== currentLocation)
                  .map(location => (
                    <button
                      key={location.id}
                      onClick={() => moveToLocation(location.id)}
                      className="w-full flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500 rounded-lg transition-colors duration-200"
                    >
                      <span className="text-2xl">{location.emoji}</span>
                      <div className="text-left">
                        <p className="font-medium text-gray-900 dark:text-white">{location.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Click to travel</p>
                      </div>
                      {exploredLocations.includes(location.id) && (
                        <CheckCircle className="w-4 h-4 text-emerald-500 ml-auto" />
                      )}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Found Clues */}
      {foundClues.length > 0 && (
        <div className="mt-6 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
          <h4 className="text-sm font-medium text-emerald-800 dark:text-emerald-200 mb-2">
            🏆 Clues Found ({foundClues.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {foundClues.map((clueId) => {
              const clue = clues.find(c => c.id === clueId);
              const location = locations.find(l => l.id === clue?.locationId);
              return (
                <span
                  key={clueId}
                  className="px-2 py-1 bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-full text-xs font-medium"
                >
                  {location?.emoji} {location?.name}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Clue Modal */}
      {showClueModal && currentClue && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md">
            <div className="p-6">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Clue Discovered!
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {currentClue.points} points available
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800 mb-4">
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                  {currentClue.question}
                </p>
              </div>

              {showHint && (
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800 mb-4">
                  <div className="flex items-start space-x-2">
                    <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">Hint:</p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        {currentClue.hint}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmitAnswer()}
                  placeholder="Type your answer here..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!userAnswer.trim()}
                    className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200 font-medium"
                  >
                    Submit Answer
                  </button>
                  
                  <div className="flex gap-2">
                    {!showHint && (
                      <button
                        onClick={() => setShowHint(true)}
                        className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors duration-200 font-medium"
                      >
                        Show Hint
                      </button>
                    )}
                    <button
                      onClick={() => setShowClueModal(false)}
                      className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 font-medium"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreasureHunt;