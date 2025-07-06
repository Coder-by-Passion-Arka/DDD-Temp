import React, { useState, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Trophy, Flame, Menu, X, Gamepad2 } from "lucide-react";
import Sidebar from './Sidebar';
import ThemeToggle from './ThemeToggle';
import FloatingChatbot from './FloatingChatbot';
import LeaderboardPanel from './LeaderboardPanel';
import GameModal from "./GameModal";

const Breadcrumb: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [showGamesTooltip, setShowGamesTooltip] = useState(false);
  const [showLeaderboardTooltip, setShowLeaderboardTooltip] = useState(false);
  const [showStreakTooltip, setShowStreakTooltip] = useState(false);
  const gamesTooltipTimeout = useRef<NodeJS.Timeout | null>(null);
  const leaderboardTooltipTimeout = useRef<NodeJS.Timeout | null>(null);
  const streakTooltipTimeout = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  
  // Current user's streak - this could come from props or context in a real app
  const currentStreak = 12;

  const handleStreakClick = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      setShowStreakTooltip(true);
      if (streakTooltipTimeout.current) clearTimeout(streakTooltipTimeout.current);
      streakTooltipTimeout.current = setTimeout(() => setShowStreakTooltip(false), 2000);
    }
    // Navigate to dashboard and scroll to streak section
    navigate('/dashboard');
    setTimeout(() => {
      const streakElement = document.getElementById('streak-section');
      if (streakElement) {
        streakElement.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        });
        streakElement.classList.add('ring-4', 'ring-orange-300', 'ring-opacity-50');
        setTimeout(() => {
          streakElement.classList.remove('ring-4', 'ring-orange-300', 'ring-opacity-50');
        }, 2000);
      }
    }, 100);
  };

  // Hide tooltips when clicking outside
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      setShowGamesTooltip(false);
      setShowLeaderboardTooltip(false);
      setShowStreakTooltip(false);
    };
    if (showGamesTooltip || showLeaderboardTooltip || showStreakTooltip) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [showGamesTooltip, showLeaderboardTooltip, showStreakTooltip]);

  const handleGamesClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowGamesTooltip(true);
    if (gamesTooltipTimeout.current) clearTimeout(gamesTooltipTimeout.current);
    gamesTooltipTimeout.current = setTimeout(() => setShowGamesTooltip(false), 2000);
    setIsGameModalOpen(true);
  };

  const handleLeaderboardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowLeaderboardTooltip(true);
    if (leaderboardTooltipTimeout.current) clearTimeout(leaderboardTooltipTimeout.current);
    leaderboardTooltipTimeout.current = setTimeout(() => setShowLeaderboardTooltip(false), 2000);
    setIsLeaderboardOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 transition-all duration-500">
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileMenuOpen={mobileMenuOpen}
        onMobileToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      {/* Mobile Sticky Top Panel */}
      <div className="fixed top-0 left-0 right-0 z-50 lg:hidden">
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Left side - Menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>

            {/* Center - App Logo/Title */}
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Trophy className="w-3 h-3 text-white" />
              </div>
              <span className="font-bold text-gray-900 dark:text-white text-sm">
                PeerEval
              </span>
            </div>

            {/* Right side - Controls */}
            <div className="flex items-center space-x-2">
              {/* Streak Counter */}
              <button
                onClick={handleStreakClick}
                className="relative p-3 w-12 h-12 flex items-center justify-center rounded-xl bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-all duration-200 group"
                aria-label="View streak details"
                type="button"
              >
                <Flame className="w-6 h-6 text-orange-500 group-hover:text-orange-600 transition-colors duration-200" />
                {/* Streak tooltip below icon */}
                <div className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded whitespace-nowrap transition-opacity duration-200 ${showStreakTooltip ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                  {currentStreak} day streak - Click to view
                </div>
              </button>

              {/* Games Button */}
              <button
                onClick={handleGamesClick}
                className="relative p-3 w-12 h-12 flex items-center justify-center rounded-xl bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/30 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 group"
                aria-label="Open games"
                type="button"
              >
                <Gamepad2 className="w-6 h-6 text-purple-500 group-hover:text-purple-600 transition-colors duration-200" />
                {/* Games tooltip below icon */}
                <div className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded whitespace-nowrap transition-opacity duration-200 ${showGamesTooltip ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                  Play games
                </div>
              </button>

              {/* Leaderboard Button */}
              <button
                onClick={handleLeaderboardClick}
                className="relative p-3 w-12 h-12 flex items-center justify-center rounded-xl bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/30 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 group"
                aria-label="View leaderboard"
                type="button"
              >
                <Trophy className="w-6 h-6 text-amber-500 group-hover:text-amber-600 transition-colors duration-200" />
                {/* Notification Badge */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white leading-none">!</span>
                </div>
                {/* Leaderboard tooltip below icon */}
                <div className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded whitespace-nowrap transition-opacity duration-200 ${showLeaderboardTooltip ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                  Leaderboard
                </div>
              </button>


              {/* Theme Toggle */}
              <div className="scale-90">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Top Controls (hidden on mobile) */}
      <div className="absolute top-4 right-4 z-10 hidden lg:flex items-center space-x-3">
        {/* Streak Counter - Now Clickable */}
        <button
          onClick={handleStreakClick}
          className="relative p-3 rounded-xl bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/30 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 group cursor-pointer"
          aria-label="View streak details"
        >
          <div className="flex items-center space-x-2">
            <Flame className="w-6 h-6 text-orange-500 group-hover:text-orange-600 group-hover:scale-110 transition-all duration-200" />
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {currentStreak}
            </span>
          </div>

          {/* Streak tooltip */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            {currentStreak} day streak - Click to view details
          </div>
        </button>

        {/* Games Button */}
        <button
          onClick={handleGamesClick}
          className="relative p-3 rounded-xl bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/30 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 group"
          aria-label="Open games"
        >
          <Gamepad2 className="w-6 h-6 text-purple-500 group-hover:text-purple-600 transition-colors duration-200" />

          {/* Games tooltip */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Play games
          </div>
        </button>

        {/* Leaderboard Button */}
        <button
          onClick={handleLeaderboardClick}
          className="relative p-3 rounded-xl bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/30 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 group"
          aria-label="View leaderboard"
        >
          <Trophy className="w-6 h-6 text-amber-500 group-hover:text-amber-600 transition-colors duration-200" />

          {/* Notification Badge */}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-white">!</span>
          </div>

          {/* Leaderboard tooltip */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            View leaderboard
          </div>
        </button>

        {/* Theme Toggle with tooltip */}
        <div className="relative group">
          <ThemeToggle />
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Toggle theme
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
        } ml-0`}
      >
        <main className="p-4 sm:p-6 lg:p-8 pt-24 sm:pt-24 lg:pt-20">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      <FloatingChatbot />
      <LeaderboardPanel
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
      />
      <GameModal
        isOpen={isGameModalOpen}
        onClose={() => setIsGameModalOpen(false)}
      />
    </div>
  );
};

export default Breadcrumb;