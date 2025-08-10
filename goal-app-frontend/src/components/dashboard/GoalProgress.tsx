import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, Clock, TrendingUp } from 'lucide-react';
import { MotionCard } from '../common/MotionCard';

interface GoalProgressProps {
  totalGoals: number;
  completedGoals: number;
  pendingGoals: number;
  overdueGoals: number;
}

export const GoalProgress: React.FC<GoalProgressProps> = ({
  totalGoals,
  completedGoals,
  pendingGoals,
  overdueGoals,
}) => {
  const completionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;

  const progressItems = [
    {
      label: 'Completed',
      value: completedGoals,
      icon: Trophy,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-200',
    },
    {
      label: 'In Progress',
      value: pendingGoals,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-200',
    },
    {
      label: 'Overdue',
      value: overdueGoals,
      icon: Clock,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-200',
    },
  ];

  return (
    <MotionCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <TrendingUp className="mr-2 text-blue-600" />
          Goal Progress
        </h3>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">{completionRate.toFixed(0)}%</p>
          <p className="text-sm text-gray-600">Success Rate</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Overall Progress</span>
          <span>{completedGoals} of {totalGoals} goals</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionRate}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
          />
        </div>
      </div>

      {/* Progress Items */}
      <div className="grid grid-cols-3 gap-4">
        {progressItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg border ${item.bgColor} ${item.borderColor}`}
          >
            <div className="flex items-center justify-between mb-2">
              <item.icon className={`${item.color}`} size={20} />
              <span className={`text-2xl font-bold ${item.color}`}>
                {item.value}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-700">{item.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Motivational Message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200"
      >
        <p className="text-sm text-gray-700 text-center">
          {completionRate >= 80 ? (
            <span className="font-semibold text-green-600">
              🎉 Amazing progress! You're crushing your goals!
            </span>
          ) : completionRate >= 50 ? (
            <span className="font-semibold text-blue-600">
              💪 Great work! Keep pushing towards your targets!
            </span>
          ) : (
            <span className="font-semibold text-purple-600">
              🚀 Every journey starts with a single step. You've got this!
            </span>
          )}
        </p>
      </motion.div>
    </MotionCard>
  );
};
