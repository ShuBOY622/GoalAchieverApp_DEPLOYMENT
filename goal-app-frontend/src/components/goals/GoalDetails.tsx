import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Users, 
  Target, 
  Clock, 
  CheckCircle, 
  User,
  Edit3,
  Trash2,
  Share2
} from 'lucide-react';
import { Goal } from '../../types/goal';
import { MotionCard } from '../common/MotionCard';
import { AnimatedButton } from '../common/AnimatedButton';
import { formatDate, formatTimeAgo } from '../../utils/helpers';

interface GoalDetailsProps {
  goal: Goal;
  onComplete: (goalId: number) => void;
  onEdit?: (goal: Goal) => void;
  onDelete?: (goalId: number) => void;
  onShare?: (goal: Goal) => void;
  currentUserId: number;
}

export const GoalDetails: React.FC<GoalDetailsProps> = ({
  goal,
  onComplete,
  onEdit,
  onDelete,
  onShare,
  currentUserId,
}) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const userAssignment = goal.assignments.find(a => a.userId === currentUserId);
  const isCompleted = userAssignment?.status === 'COMPLETED';
  const isCreator = goal.createdBy === currentUserId;
  const isOverdue = new Date(goal.deadline) < new Date() && !isCompleted;

  const difficultyConfig = {
    EASY: { color: 'text-green-600', bg: 'bg-green-100', points: 10 },
    MEDIUM: { color: 'text-yellow-600', bg: 'bg-yellow-100', points: 20 },
    HARD: { color: 'text-red-600', bg: 'bg-red-100', points: 30 },
  };

  const completedCount = goal.assignments.filter(a => a.status === 'COMPLETED').length;
  const progressPercentage = (completedCount / goal.assignments.length) * 100;

  return (
    <MotionCard className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              goal.type === 'SHARED' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
            }`}>
              {goal.type === 'SHARED' ? <Users size={12} className="inline mr-1" /> : <Target size={12} className="inline mr-1" />}
              {goal.type}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyConfig[goal.difficulty].bg} ${difficultyConfig[goal.difficulty].color}`}>
              {goal.difficulty} • {difficultyConfig[goal.difficulty].points}pts
            </span>
            {isOverdue && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">
                OVERDUE
              </span>
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{goal.title}</h2>
          <p className="text-gray-600 mb-4">{goal.description}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {onShare && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onShare(goal)}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Share2 size={18} />
            </motion.button>
          )}
          
          {isCreator && onEdit && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onEdit(goal)}
              className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            >
              <Edit3 size={18} />
            </motion.button>
          )}
          
          {isCreator && onDelete && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowConfirmDelete(true)}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={18} />
            </motion.button>
          )}
        </div>
      </div>

      {/* Goal Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <Calendar className="text-blue-600" size={20} />
          <div>
            <p className="text-sm font-medium text-gray-900">Deadline</p>
            <p className="text-sm text-gray-600">{formatDate(goal.deadline)}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <Clock className="text-green-600" size={20} />
          <div>
            <p className="text-sm font-medium text-gray-900">Created</p>
            <p className="text-sm text-gray-600">{formatTimeAgo(goal.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">Progress</h3>
          <span className="text-sm font-medium text-gray-600">
            {completedCount} / {goal.assignments.length} completed
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1 }}
            className="h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
          />
        </div>
      </div>

      {/* Assignments */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Participants</h3>
        <div className="space-y-2">
          {goal.assignments.map((assignment, index) => (
            <motion.div
              key={`${assignment.userId}-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="text-white" size={16} />
                </div>
                <div>
                  <p className="font-medium text-gray-900">User {assignment.userId}</p>
                  {assignment.completedAt && (
                    <p className="text-xs text-gray-500">
                      Completed {formatTimeAgo(assignment.completedAt)}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {assignment.status === 'COMPLETED' ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle size={12} className="mr-1" />
                    Completed
                  </span>
                ) : assignment.status === 'MISSED' ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <Clock size={12} className="mr-1" />
                    Missed
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Clock size={12} className="mr-1" />
                    Pending
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        {!isCompleted && !isOverdue && (
          <AnimatedButton
            variant="success"
            onClick={() => onComplete(goal.id)}
            className="flex-1"
          >
            <CheckCircle size={18} className="mr-2" />
            Complete Goal
          </AnimatedButton>
        )}
        
        {isCompleted && (
          <div className="flex-1 bg-green-100 text-green-700 px-4 py-3 rounded-lg flex items-center justify-center font-medium">
            <CheckCircle size={18} className="mr-2" />
            Goal Completed! 🎉
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Goal</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this goal? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <AnimatedButton
                variant="secondary"
                onClick={() => setShowConfirmDelete(false)}
                className="flex-1"
              >
                Cancel
              </AnimatedButton>
              <AnimatedButton
                variant="danger"
                onClick={() => {
                  onDelete?.(goal.id);
                  setShowConfirmDelete(false);
                }}
                className="flex-1"
              >
                Delete
              </AnimatedButton>
            </div>
          </motion.div>
        </div>
      )}
    </MotionCard>
  );
};
