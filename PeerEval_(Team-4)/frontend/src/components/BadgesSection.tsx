import React, { useState } from 'react';
import { 
  Trophy, 
  Star, 
  Flame, 
  Zap, 
  Crown, 
  Shield, 
  Target, 
  Rocket,
  Award,
  Medal,
  Gem,
  Sparkles,
  ChevronRight,
  Lock,
  CheckCircle
} from 'lucide-react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  borderColor: string;
  level: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  category: 'evaluation' | 'assignment' | 'streak' | 'collaboration' | 'achievement';
  requirement: string;
  progress: number;
  maxProgress: number;
  earned: boolean;
  earnedDate?: string;
  trailTokens: number;
}

interface BadgesSectionProps {
  userBadges: Badge[];
  totalTrailTokens: number;
}

const BadgesSection: React.FC<BadgesSectionProps> = ({ userBadges, totalTrailTokens }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showEarnedOnly, setShowEarnedOnly] = useState(false);

  const categories = [
    { id: 'all', label: 'All Badges', icon: Trophy },
    { id: 'evaluation', label: 'Evaluation', icon: Target },
    { id: 'assignment', label: 'Assignment', icon: Award },
    { id: 'streak', label: 'Streak', icon: Flame },
    { id: 'collaboration', label: 'Collaboration', icon: Shield },
    { id: 'achievement', label: 'Achievement', icon: Crown }
  ];

  const filteredBadges = userBadges.filter(badge => {
    const categoryMatch = selectedCategory === 'all' || badge.category === selectedCategory;
    const earnedMatch = !showEarnedOnly || badge.earned;
    return categoryMatch && earnedMatch;
  });

  const earnedBadges = userBadges.filter(badge => badge.earned);
  const totalBadges = userBadges.length;

  const getLevelColor = (level: Badge['level']) => {
    switch (level) {
      case 'bronze': return 'from-amber-600 to-amber-700';
      case 'silver': return 'from-gray-400 to-gray-500';
      case 'gold': return 'from-yellow-400 to-yellow-500';
      case 'platinum': return 'from-purple-400 to-purple-500';
      case 'diamond': return 'from-cyan-400 to-cyan-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-lg dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Achievement Badges</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {earnedBadges.length} of {totalBadges} badges earned
            </p>
          </div>
        </div>

        {/* Trail Tokens Display */}
        <div className="flex items-center space-x-2 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 px-4 py-2 rounded-xl border border-amber-200 dark:border-amber-800">
          <Gem className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <div className="text-center">
            <p className="text-lg font-bold text-amber-700 dark:text-amber-300">{totalTrailTokens}</p>
            <p className="text-xs text-amber-600 dark:text-amber-400">Trail Tokens</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600 dark:text-gray-400">Progress</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {Math.round((earnedBadges.length / totalBadges) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${(earnedBadges.length / totalBadges) * 100}%` }}
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{category.label}</span>
            </button>
          );
        })}
      </div>

      {/* Toggle for Earned Only */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="earnedOnly"
            checked={showEarnedOnly}
            onChange={(e) => setShowEarnedOnly(e.target.checked)}
            className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <label htmlFor="earnedOnly" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Show earned badges only
          </label>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {filteredBadges.length} badges
        </span>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBadges.map((badge) => {
          const Icon = badge.icon;
          const progressPercentage = (badge.progress / badge.maxProgress) * 100;
          
          return (
            <div
              key={badge.id}
              className={`relative p-4 rounded-xl border transition-all duration-200 hover:shadow-md ${
                badge.earned
                  ? `${badge.bgColor} ${badge.borderColor} border-2`
                  : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {/* Badge Icon */}
              <div className="flex items-start justify-between mb-3">
                <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center ${
                  badge.earned 
                    ? `bg-gradient-to-br ${getLevelColor(badge.level)}` 
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}>
                  <Icon className={`w-6 h-6 ${badge.earned ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                  {badge.earned && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                  )}
                  {!badge.earned && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-gray-400 dark:bg-gray-500 rounded-full flex items-center justify-center">
                      <Lock className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>

                {/* Trail Tokens */}
                <div className="flex items-center space-x-1 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded-full">
                  <Gem className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
                    {badge.trailTokens}
                  </span>
                </div>
              </div>

              {/* Badge Info */}
              <div className="mb-3">
                <h4 className={`font-semibold mb-1 ${
                  badge.earned ? badge.color : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {badge.name}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  {badge.description}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {badge.requirement}
                </p>
              </div>

              {/* Progress Bar (for unearned badges) */}
              {!badge.earned && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Progress</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {badge.progress}/{badge.maxProgress}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Earned Date */}
              {badge.earned && badge.earnedDate && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Earned</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {formatDate(badge.earnedDate)}
                  </span>
                </div>
              )}

              {/* Level Badge */}
              <div className="absolute top-2 left-2">
                <span className={`px-2 py-1 text-xs font-bold rounded-full text-white bg-gradient-to-r ${getLevelColor(badge.level)}`}>
                  {badge.level.toUpperCase()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredBadges.length === 0 && (
        <div className="text-center py-8">
          <Trophy className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 mb-2">No badges found</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            {showEarnedOnly ? 'You haven\'t earned any badges in this category yet.' : 'Try a different category filter.'}
          </p>
        </div>
      )}

      {/* View All Button */}
      <div className="mt-6 text-center">
        <button className="inline-flex items-center space-x-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium text-sm transition-colors duration-200">
          <span>View Badge Collection</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default BadgesSection;