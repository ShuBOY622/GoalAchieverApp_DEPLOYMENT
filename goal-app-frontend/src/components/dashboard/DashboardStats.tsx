import React from 'react';
import { motion } from 'framer-motion';
import { Target, Trophy, Users, TrendingUp, Flame, Star, Award, Zap } from 'lucide-react';
import { MotionCard } from '../common/MotionCard';

interface StatsData {
  totalGoals: number;
  completedGoals: number;
  totalPoints: number;
  friendsCount: number;
  currentStreak?: number;
  pendingGoals?: number;
  personalGoals?: number;
  sharedGoals?: number;
}

interface DashboardStatsProps {
  stats: StatsData;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  
  const statItems = [
    {
      icon: Target,
      label: 'Total Goals',
      value: stats.totalGoals,
      color: 'from-blue-500 to-purple-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      description: `${stats.personalGoals || 0} personal, ${stats.sharedGoals || 0} shared`,
      emoji: '🎯'
    },
    {
      icon: Trophy,
      label: 'Completed',
      value: stats.completedGoals,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      description: `${stats.pendingGoals || 0} still pending`,
      emoji: '🏆'
    },
    {
      icon: TrendingUp,
      label: 'Total Points',
      value: stats.totalPoints,
      color: 'from-yellow-500 to-orange-600',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
      description: 'Keep earning more!',
      emoji: '⭐'
    },
    {
      icon: stats.currentStreak && stats.currentStreak > 0 ? Flame : Users,
      label: stats.currentStreak && stats.currentStreak > 0 ? 'Current Streak' : 'Friends',
      value: stats.currentStreak && stats.currentStreak > 0 ? stats.currentStreak : stats.friendsCount,
      color: stats.currentStreak && stats.currentStreak > 0 ? 'from-orange-500 to-red-600' : 'from-pink-500 to-rose-600',
      bgColor: stats.currentStreak && stats.currentStreak > 0 ? 'bg-orange-50' : 'bg-pink-50',
      textColor: stats.currentStreak && stats.currentStreak > 0 ? 'text-orange-600' : 'text-pink-600',
      description: stats.currentStreak && stats.currentStreak > 0 ? 'days in a row!' : 'connections made',
      emoji: stats.currentStreak && stats.currentStreak > 0 ? '🔥' : '👥'
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statItems.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            delay: index * 0.1,
            type: 'spring',
            stiffness: 100,
            damping: 10
          }}
          whileHover={{
            scale: 1.05,
            y: -5,
            transition: { duration: 0.2 }
          }}
          className="group"
        >
          <MotionCard className={`relative overflow-hidden ${item.bgColor} border-0 shadow-lg hover:shadow-xl transition-all duration-300`}>
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 right-0 w-32 h-32 transform rotate-45 translate-x-16 -translate-y-16">
                <div className={`w-full h-full bg-gradient-to-r ${item.color} rounded-lg`} />
              </div>
            </div>
            
            {/* Content */}
            <div className="relative p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-2xl">{item.emoji}</span>
                    <p className={`text-sm font-semibold ${item.textColor} uppercase tracking-wide`}>
                      {item.label}
                    </p>
                  </div>
                  <motion.p
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      delay: 0.3 + index * 0.1,
                      type: 'spring',
                      stiffness: 200,
                      damping: 10
                    }}
                    className="text-4xl font-bold text-gray-900 mb-1"
                  >
                    {item.value}
                  </motion.p>
                  <p className="text-xs text-gray-500 font-medium">
                    {item.description}
                  </p>
                </div>
                
                <motion.div
                  whileHover={{
                    rotate: 360,
                    scale: 1.1
                  }}
                  transition={{ duration: 0.6 }}
                  className={`p-3 rounded-xl bg-gradient-to-r ${item.color} shadow-lg group-hover:shadow-xl`}
                >
                  <item.icon className="text-white" size={24} />
                </motion.div>
              </div>
              
              {/* Progress Bar */}
              <div className="relative">
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{
                      delay: 0.5 + index * 0.1,
                      duration: 1.5,
                      ease: "easeOut"
                    }}
                    className={`h-full bg-gradient-to-r ${item.color} rounded-full relative overflow-hidden`}
                  >
                    {/* Shimmer effect */}
                    <motion.div
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{
                        delay: 1 + index * 0.1,
                        duration: 1,
                        ease: "easeInOut"
                      }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    />
                  </motion.div>
                </div>
              </div>
            </div>
            
            {/* Hover Glow Effect */}
            <motion.div
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-5 pointer-events-none`}
            />
          </MotionCard>
        </motion.div>
      ))}
    </div>
  );
};
