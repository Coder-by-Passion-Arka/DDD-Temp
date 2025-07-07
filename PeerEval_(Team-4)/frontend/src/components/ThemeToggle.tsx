import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-3 rounded-xl bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/30 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 group"
      aria-label="Toggle theme"
    >
      <div className="relative w-6 h-6">
        <Sun
          className={`absolute inset-0 w-6 h-6 text-amber-500 transition-all duration-300 ${
            theme === "dark"
              ? "opacity-0 rotate-90 scale-0"
              : "opacity-100 rotate-0 scale-100"
          }`}
        />
        <Moon
          className={`absolute inset-0 w-6 h-6 text-blue-400 transition-all duration-300 ${
            theme === "light"
              ? "opacity-0 -rotate-90 scale-0"
              : "opacity-100 rotate-0 scale-100"
          }`}
        />
      </div>
    </button>
  );
};

export default ThemeToggle;