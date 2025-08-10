import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, CheckCircle, Clock, Target } from 'lucide-react';
import { Goal } from '../../types/goal';
import { MotionCard } from '../common/MotionCard';
import { AnimatedButton } from '../common/AnimatedButton';
import { format } from 'date-fns';

interface GoalCardProps {
  goal: Goal;
  onComplete: (goalId: number) => void;
  isCompleted: boolean;
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal, onComplete, isCompleted }) => {
  const difficultyColors = {
    EASY: 'from-green-400 to-emerald-500',
    MEDIUM: 'from-yellow-400 to-orange-500',
    HARD: 'from-red-400 to-pink-500',
  };

  const difficultyPoints = {
    EASY: 10,
    MEDIUM: 20,
    HARD: 30,
  };

  const isOverdue = new Date(goal.deadline) < new Date() && !isCompleted;

  return (
    <MotionCard className={`relative ${isCompleted ? 'opacity-75' : ''} ${isOverdue ? 'border-red-300 border-2' : ''}`}>
      {/* Difficulty Badge */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
        className={`absolute top-4 right-4 px-3 py-1 rounded-full bg-gradient-to-r ${difficultyColors[goal.difficulty]} text-white text-xs font-bold`}
      >
        {goal.difficulty} • {difficultyPoints[goal.difficulty]}pts
      </motion.div>

      {/* Goal Type Badge */}
      <div className="flex items-center mb-3">
        <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          goal.type === 'SHARED' 
            ? 'bg-blue-100 text-blue-600' 
            : 'bg-gray-100 text-gray-600'
        }`}>
          {goal.type === 'SHARED' ? <Users size={12} className="mr-1" /> : <Target size={12} className="mr-1" />}
          {goal.type}
        </div>
      </div>

      {/* Goal Content */}
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-xl font-bold text-gray-900 mb-2"
      >
        {goal.title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-gray-600 mb-4 line-clamp-2"
      >
        {goal.description}
      </motion.p>

      {/* Deadline */}
      <div className="flex items-center text-sm text-gray-500 mb-4">
        <Calendar size={16} className="mr-2" />
        <span className={isOverdue ? 'text-red-500 font-medium' : ''}>
          Due: {format(new Date(goal.deadline), 'MMM dd, yyyy')}
        </span>
        {isOverdue && (
          <motion.span
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="ml-2 text-red-500 font-bold"
          >
            OVERDUE
          </motion.span>
        )}
      </div>

      {/* Assignments */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Progress:</span>
          <span className="font-medium">
            {goal.assignments.filter(a => a.status === 'COMPLETED').length} / {goal.assignments.length} completed
          </span>
        </div>
        
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(goal.assignments.filter(a => a.status === 'COMPLETED').length / goal.assignments.length) * 100}%` }}
          transition={{ duration: 1, delay: 0.5 }}
          className="w-full bg-gray-200 rounded-full h-2 mt-2"
        >
          <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full"></div>
        </motion.div>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        {!isCompleted ? (
          <AnimatedButton
            variant="success"
            size="sm"
            onClick={() => onComplete(goal.id)}
            className="flex-1"
          >
            <CheckCircle size={16} className="mr-2" />
            Complete Goal
          </AnimatedButton>
        ) : (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="flex-1 bg-green-100 text-green-600 px-4 py-2 rounded-lg flex items-center justify-center font-medium"
          >
            <CheckCircle size={16} className="mr-2" />
            Completed! 🎉
          </motion.div>
        )}
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Clock size={16} />
        </motion.button>
      </div>

      {/* Completion Animation */}
      {isCompleted && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="absolute inset-0 bg-green-500/10 rounded-xl flex items-center justify-center"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 360, 0]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-6xl"
          >
            🎯
          </motion.div>
        </motion.div>
      )}
    </MotionCard>
  );
};
