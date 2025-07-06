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
  Users,
  Clock,
  BookOpen,
  CheckCircle,
  TrendingUp,
  Heart,
  Brain,
  Coffee,
  Lightbulb,
  ThumbsUp,
  MessageCircle,
  Calendar,
  Compass
} from 'lucide-react';

export interface Badge {
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

export const mockUserBadges: Badge[] = [
  // EVALUATION BADGES
  {
    id: 'eval-rookie',
    name: 'Evaluation Rookie',
    description: 'Started your peer evaluation journey',
    icon: Target,
    color: 'text-amber-700 dark:text-amber-300',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-amber-200 dark:border-amber-800',
    level: 'bronze',
    category: 'evaluation',
    requirement: 'Complete 5 peer evaluations',
    progress: 5,
    maxProgress: 5,
    earned: true,
    earnedDate: '2024-12-15',
    trailTokens: 10
  },
  {
    id: 'eval-scholar',
    name: 'Evaluation Scholar',
    description: 'Becoming a thoughtful evaluator',
    icon: BookOpen,
    color: 'text-gray-700 dark:text-gray-300',
    bgColor: 'bg-gray-50 dark:bg-gray-900/20',
    borderColor: 'border-gray-200 dark:border-gray-800',
    level: 'silver',
    category: 'evaluation',
    requirement: 'Complete 25 peer evaluations',
    progress: 18,
    maxProgress: 25,
    earned: false,
    trailTokens: 25
  },
  {
    id: 'eval-master',
    name: 'Evaluation Virtuoso',
    description: 'Master of constructive feedback',
    icon: Crown,
    color: 'text-yellow-700 dark:text-yellow-300',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    level: 'gold',
    category: 'evaluation',
    requirement: 'Complete 100 peer evaluations',
    progress: 42,
    maxProgress: 100,
    earned: false,
    trailTokens: 50
  },
  {
    id: 'eval-legend',
    name: 'Feedback Oracle',
    description: 'Legendary evaluation expertise',
    icon: Sparkles,
    color: 'text-purple-700 dark:text-purple-300',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    level: 'platinum',
    category: 'evaluation',
    requirement: 'Complete 250 peer evaluations with 95% quality score',
    progress: 42,
    maxProgress: 250,
    earned: false,
    trailTokens: 100
  },

  // ASSIGNMENT BADGES
  {
    id: 'assign-starter',
    name: 'Assignment Ace',
    description: 'Consistent assignment completion',
    icon: CheckCircle,
    color: 'text-emerald-700 dark:text-emerald-300',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    level: 'bronze',
    category: 'assignment',
    requirement: 'Submit 10 assignments on time',
    progress: 10,
    maxProgress: 10,
    earned: true,
    earnedDate: '2024-12-10',
    trailTokens: 15
  },
  {
    id: 'assign-perfectionist',
    name: 'Perfectionist',
    description: 'Excellence in every submission',
    icon: Star,
    color: 'text-yellow-700 dark:text-yellow-300',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    level: 'gold',
    category: 'assignment',
    requirement: 'Achieve 95%+ average score on 20 assignments',
    progress: 12,
    maxProgress: 20,
    earned: false,
    trailTokens: 40
  },
  {
    id: 'assign-speedster',
    name: 'Lightning Submitter',
    description: 'Speed and quality combined',
    icon: Zap,
    color: 'text-blue-700 dark:text-blue-300',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    level: 'silver',
    category: 'assignment',
    requirement: 'Submit 15 assignments 24+ hours early',
    progress: 8,
    maxProgress: 15,
    earned: false,
    trailTokens: 30
  },

  // STREAK BADGES
  {
    id: 'streak-igniter',
    name: 'Streak Igniter',
    description: 'Started building momentum',
    icon: Flame,
    color: 'text-orange-700 dark:text-orange-300',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    borderColor: 'border-orange-200 dark:border-orange-800',
    level: 'bronze',
    category: 'streak',
    requirement: 'Maintain a 7-day activity streak',
    progress: 7,
    maxProgress: 7,
    earned: true,
    earnedDate: '2024-12-08',
    trailTokens: 20
  },
  {
    id: 'streak-warrior',
    name: 'Consistency Warrior',
    description: 'Unwavering dedication',
    icon: Shield,
    color: 'text-red-700 dark:text-red-300',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    level: 'silver',
    category: 'streak',
    requirement: 'Maintain a 30-day activity streak',
    progress: 12,
    maxProgress: 30,
    earned: false,
    trailTokens: 35
  },
  {
    id: 'streak-legend',
    name: 'Unstoppable Force',
    description: 'Legendary consistency',
    icon: Rocket,
    color: 'text-purple-700 dark:text-purple-300',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    level: 'platinum',
    category: 'streak',
    requirement: 'Maintain a 100-day activity streak',
    progress: 12,
    maxProgress: 100,
    earned: false,
    trailTokens: 75
  },

  // COLLABORATION BADGES
  {
    id: 'collab-helper',
    name: 'Helpful Peer',
    description: 'Always ready to help others',
    icon: Heart,
    color: 'text-pink-700 dark:text-pink-300',
    bgColor: 'bg-pink-50 dark:bg-pink-900/20',
    borderColor: 'border-pink-200 dark:border-pink-800',
    level: 'bronze',
    category: 'collaboration',
    requirement: 'Receive 10 helpful feedback ratings',
    progress: 10,
    maxProgress: 10,
    earned: true,
    earnedDate: '2024-12-12',
    trailTokens: 15
  },
  {
    id: 'collab-mentor',
    name: 'Peer Mentor',
    description: 'Guiding others to success',
    icon: Users,
    color: 'text-indigo-700 dark:text-indigo-300',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    borderColor: 'border-indigo-200 dark:border-indigo-800',
    level: 'gold',
    category: 'collaboration',
    requirement: 'Help 25 peers improve their work',
    progress: 15,
    maxProgress: 25,
    earned: false,
    trailTokens: 45
  },
  {
    id: 'collab-communicator',
    name: 'Master Communicator',
    description: 'Excellence in peer interaction',
    icon: MessageCircle,
    color: 'text-teal-700 dark:text-teal-300',
    bgColor: 'bg-teal-50 dark:bg-teal-900/20',
    borderColor: 'border-teal-200 dark:border-teal-800',
    level: 'silver',
    category: 'collaboration',
    requirement: 'Maintain 95%+ communication quality score',
    progress: 8,
    maxProgress: 10,
    earned: false,
    trailTokens: 30
  },

  // ACHIEVEMENT BADGES
  {
    id: 'achieve-innovator',
    name: 'Creative Innovator',
    description: 'Thinking outside the box',
    icon: Lightbulb,
    color: 'text-yellow-700 dark:text-yellow-300',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    level: 'gold',
    category: 'achievement',
    requirement: 'Submit 5 highly creative solutions',
    progress: 3,
    maxProgress: 5,
    earned: false,
    trailTokens: 50
  },
  {
    id: 'achieve-improver',
    name: 'Growth Mindset',
    description: 'Continuous improvement champion',
    icon: TrendingUp,
    color: 'text-emerald-700 dark:text-emerald-300',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
    level: 'silver',
    category: 'achievement',
    requirement: 'Show 50% improvement in evaluation scores',
    progress: 35,
    maxProgress: 50,
    earned: false,
    trailTokens: 35
  },
  {
    id: 'achieve-early-bird',
    name: 'Early Bird',
    description: 'First to embrace new challenges',
    icon: Coffee,
    color: 'text-amber-700 dark:text-amber-300',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-amber-200 dark:border-amber-800',
    level: 'bronze',
    category: 'achievement',
    requirement: 'Be among first 10 to complete new assignments',
    progress: 6,
    maxProgress: 10,
    earned: false,
    trailTokens: 20
  },
  {
    id: 'achieve-diamond',
    name: 'Diamond Standard',
    description: 'The pinnacle of excellence',
    icon: Gem,
    color: 'text-cyan-700 dark:text-cyan-300',
    bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
    borderColor: 'border-cyan-200 dark:border-cyan-800',
    level: 'diamond',
    category: 'achievement',
    requirement: 'Achieve top 1% performance across all metrics',
    progress: 0,
    maxProgress: 1,
    earned: false,
    trailTokens: 200
  },
  {
    id: 'achieve-explorer',
    name: 'Knowledge Explorer',
    description: 'Curious mind, endless learning',
    icon: Compass,
    color: 'text-purple-700 dark:text-purple-300',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    level: 'silver',
    category: 'achievement',
    requirement: 'Complete assignments in 5+ different subjects',
    progress: 4,
    maxProgress: 5,
    earned: false,
    trailTokens: 30
  }
];

export const calculateTotalTrailTokens = (badges: Badge[]): number => {
  return badges
    .filter(badge => badge.earned)
    .reduce((total, badge) => total + badge.trailTokens, 0);
};