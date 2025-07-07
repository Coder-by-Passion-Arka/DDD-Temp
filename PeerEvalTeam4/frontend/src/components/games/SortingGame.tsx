import React, { useEffect, useState } from "react";
import { ArrowLeft, Clock, Target, MousePointerClick, RefreshCw } from "lucide-react";

interface SortingGameProps {
  onBack: () => void;
  onComplete: (won: boolean, score: number) => void;
}

type Category = 'Algorithms' | 'Data Structures' | 'Operating Systems' | 'Networking' | 'Databases';

type ConceptItem = {
  id: number;
  label: string;
  category: Category;
};

const allConcepts: ConceptItem[] = [
  { id: 1, label: 'Merge Sort', category: 'Algorithms' },
  { id: 2, label: 'Binary Tree', category: 'Data Structures' },
  { id: 3, label: 'Round Robin', category: 'Operating Systems' },
  { id: 4, label: 'TCP/IP', category: 'Networking' },
  { id: 5, label: 'Normalization', category: 'Databases' },
  { id: 6, label: 'Dijkstra\'s Algorithm', category: 'Algorithms' },
  { id: 7, label: 'Linked List', category: 'Data Structures' },
  { id: 8, label: 'Deadlock', category: 'Operating Systems' },
  { id: 9, label: 'HTTP Protocol', category: 'Networking' },
  { id: 10, label: 'SQL Joins', category: 'Databases' },
];

const categories: Category[] = ['Algorithms', 'Data Structures', 'Operating Systems', 'Networking', 'Databases'];

const SortingGame: React.FC<SortingGameProps> = ({ onBack, onComplete }) => {
  const [concepts, setConcepts] = useState<ConceptItem[]>([]);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<string[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning) {
      interval = setInterval(() => setTime((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const loadNewConcepts = () => {
    const shuffled = [...allConcepts].sort(() => 0.5 - Math.random()).slice(0, 5);
    setConcepts(shuffled);
    setResults([]);
    setScore(0);
    setGameOver(false);
    setMoves(0);
    setTime(0);
    setTimerRunning(true);
  };

  useEffect(() => {
    loadNewConcepts();
  }, []);

  const handleDrop = (item: ConceptItem, dropZoneCategory: Category) => {
    setConcepts((prevConcepts) => {
      const updatedConcepts = prevConcepts.filter((c) => c.id !== item.id);
      const isCorrect = item.category === dropZoneCategory;

      setMoves((m) => m + 1);

      if (isCorrect) {
        setScore((s) => s + 1);
        setResults((prev) => [...prev, `✅ ${item.label} was correctly placed.`]);
      } else {
        setResults((prev) => [
          ...prev,
          `❌ ${item.label} was incorrect. Correct category: ${item.category}`,
        ]);
      }

      if (updatedConcepts.length === 0) {
        setGameOver(true);
        setTimerRunning(false);
        const finalScore = score + (isCorrect ? 1 : 0);
        onComplete(finalScore >= 3, finalScore);
      }

      return updatedConcepts;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-slate-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white p-6">
      <div className="w-full max-w-5xl mx-auto">
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
            onClick={loadNewConcepts}
            className="flex items-center space-x-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white text-sm font-medium transition"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Restart</span>
          </button>
        </div>

        {/* Scoreboard */}
        <div className="grid grid-cols-3 gap-4 mb-6 text-sm text-center">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-200 dark:border-blue-800">
            <Clock className="w-5 h-5 mx-auto mb-1 text-blue-600 dark:text-blue-400" />
            <div className="font-bold">{time}s</div>
            <div className="text-xs">Time</div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-3 border border-yellow-200 dark:border-yellow-800">
            <MousePointerClick className="w-5 h-5 mx-auto mb-1 text-yellow-600 dark:text-yellow-400" />
            <div className="font-bold">{moves}</div>
            <div className="text-xs">Moves</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 border border-purple-200 dark:border-purple-800">
            <Target className="w-5 h-5 mx-auto mb-1 text-purple-600 dark:text-purple-400" />
            <div className="font-bold">{score}</div>
            <div className="text-xs">Score</div>
          </div>
        </div>

        {/* Game Title */}
        <div className="bg-gradient-to-br from-white via-indigo-100 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-xl dark:shadow-gray-900/40 border border-gray-200 dark:border-gray-700 mb-6">
          <h1 className="text-4xl font-bold mb-6 text-purple-700 dark:text-purple-300 text-center">🧠 Sorting Challenge: CS Edition</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Concepts Panel */}
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl">
              <h3 className="text-lg font-semibold mb-2">Concepts</h3>
              {concepts.length === 0 ? (
                <p className="text-gray-500 italic">No more concepts.</p>
              ) : (
                concepts.map((concept) => (
                  <div
                    key={concept.id}
                    className="bg-blue-200 text-black rounded px-3 py-2 shadow-md cursor-move my-2"
                  >
                    {concept.label}
                  </div>
                ))
              )}
            </div>

            {/* Drop Zones */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map((cat) => (
                <div
                  key={cat}
                  className="min-h-[100px] p-4 border-2 border-dashed rounded-xl bg-white dark:bg-gray-700"
                >
                  <h4 className="font-semibold text-center mb-2">{cat}</h4>
                </div>
              ))}
            </div>
          </div>

          {/* Results Feedback */}
          <div className="mt-6 bg-white dark:bg-gray-800 border rounded p-4">
            <h4 className="text-lg font-semibold mb-2">Result Log</h4>
            {results.length === 0 ? (
              <p className="text-gray-500 italic">No moves yet.</p>
            ) : (
              <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                {results.map((msg, i) => (
                  <li key={i}>{msg}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SortingGame;
