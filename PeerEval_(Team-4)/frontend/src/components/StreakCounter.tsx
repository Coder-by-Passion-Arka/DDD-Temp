import React from 'react';
import { Flame, Trophy } from 'lucide-react';

interface StreakCounterProps {
  currentStreak: number;
  bestStreak: number;
}

const StreakCounter: React.FC<StreakCounterProps> = ({ currentStreak, bestStreak }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700 h-full">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
          <Flame className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Activity Streak</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Keep the momentum going!</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="text-center">
          <div className="relative inline-flex items-center justify-center w-24 h-24 mb-4">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-500 to-red-600 opacity-10"></div>
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-orange-500 to-red-600 opacity-20"></div>
            <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-600 text-white font-bold text-xl">
              {currentStreak}
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Streak</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">{currentStreak} days</p>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Best Streak</span>
            </div>
            <span className="text-lg font-bold text-amber-600 dark:text-amber-400">{bestStreak} days</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Progress to next milestone</span>
            <span className="font-medium text-gray-900 dark:text-white">{Math.min(currentStreak, 30)}/30</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-red-600 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${(Math.min(currentStreak, 30) / 30) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreakCounter;