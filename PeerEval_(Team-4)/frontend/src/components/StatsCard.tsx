import React from 'react';
import { DivideIcon as LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: 'emerald' | 'amber' | 'blue' | 'purple' | 'red' | 'indigo';
  trend?: string;
}

const colorClasses = {
  emerald: {
    bg: 'from-emerald-500 to-emerald-600',
    light: 'bg-emerald-50 dark:bg-emerald-900/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    icon: 'text-white'
  },
  amber: {
    bg: 'from-amber-500 to-amber-600',
    light: 'bg-amber-50 dark:bg-amber-900/20',
    text: 'text-amber-600 dark:text-amber-400',
    icon: 'text-white'
  },
  blue: {
    bg: 'from-blue-500 to-blue-600',
    light: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-600 dark:text-blue-400',
    icon: 'text-white'
  },
  purple: {
    bg: 'from-purple-500 to-purple-600',
    light: 'bg-purple-50 dark:bg-purple-900/20',
    text: 'text-purple-600 dark:text-purple-400',
    icon: 'text-white'
  },
  red: {
    bg: 'from-red-500 to-red-600',
    light: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-600 dark:text-red-400',
    icon: 'text-white'
  },
  indigo: {
    bg: 'from-indigo-500 to-indigo-600',
    light: 'bg-indigo-50 dark:bg-indigo-900/20',
    text: 'text-indigo-600 dark:text-indigo-400',
    icon: 'text-white'
  }
};

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, color, trend }) => {
  const isPositive = trend?.startsWith('+');
  const classes = colorClasses[color];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-lg dark:shadow-gray-900/30 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 group">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">{value.toLocaleString()}</p>
          {trend && (
            <div className="flex items-center space-x-1">
              {isPositive ? (
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500" />
              ) : (
                <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
              )}
              <span className={`text-xs sm:text-sm font-medium ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {trend} from last week
              </span>
            </div>
          )}
        </div>
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${classes.bg} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${classes.icon}`} />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;